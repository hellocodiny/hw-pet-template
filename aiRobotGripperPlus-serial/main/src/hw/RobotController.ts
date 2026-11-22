import {Parser, modeZero} from './protocol'
import type {Packet, OutputState} from './protocol'
import {ControlOutput} from './ControlOutput'
type Connection = 'connected'|'connecting'|'disconnected'
type Robot = {id:number;rssi:number;battery?:number;mv?:number;batteryState?:number}
export type RobotStatus = {connection:Connection;dongle:boolean;busy:boolean;scanning:boolean;robots:Robot[];robot:number|null;sensors:{left:number;right:number;cm:number}|null;monitors:string[];targets:number[];output:OutputState|null;active:boolean;rxCount:number;message:string;error:string;log:string[]}
/** Dongle connection, explicit reset handshake and PC-compatible control. */
export class RobotController {
 private state:RobotStatus={connection:'disconnected',dongle:false,busy:false,scanning:false,robots:[],robot:null,sensors:null,monitors:[],targets:[],output:null,active:false,rxCount:0,message:'USB 동글을 연결하세요.',error:'',log:[]}
 private listeners=new Set<()=>void>()
 private port?:SerialPort
 private reader?:ReadableStreamDefaultReader<Uint8Array>
 private writer?:WritableStreamDefaultWriter<Uint8Array>
 private reading?:Promise<void>
 private epoch=0
 private output=new ControlOutput(b=>this.write(b),()=>this.listeners.forEach(f=>f()),e=>this.fail(String(e)))
 private blockWaits=new Set<()=>void>()
 private closing=false
 private managementVersion=0
 private writeChain:Promise<void>=Promise.resolve()
 private timer?:ReturnType<typeof setTimeout>
 private stale?:ReturnType<typeof setInterval>
 private sensorAt=0
 private pending?:{seq:number;acked:boolean;written:boolean;settling:boolean;targets:number[];resolve:()=>void;reject:(e:Error)=>void}
 private parser=new Parser(p=>this.packet(p))
 constructor(private serial?:Pick<Serial,'requestPort'>){}
 subscribe=(fn:()=>void)=>{this.listeners.add(fn);return()=>{this.listeners.delete(fn)}}
 getSnapshot=():RobotStatus=>({...this.state,monitors:[...this.state.monitors],targets:[...this.state.targets],active:this.output.active,output:{...this.output.state,angles:[...this.output.state.angles],rgb:[...this.output.state.rgb]},robots:this.state.robots.map(r=>({...r})),log:[...this.state.log],sensors:this.state.sensors?{...this.state.sensors}:null})
 private update(p:Partial<RobotStatus>){Object.assign(this.state,p);this.listeners.forEach(f=>f())}
 private log(s:string){this.update({log:[...this.state.log,`${new Date().toLocaleTimeString()} ${s}`].slice(-40)})}
 private clear(){for(const cancel of this.blockWaits)cancel();this.blockWaits.clear();clearTimeout(this.timer);const p=this.pending;this.pending=undefined;p?.reject(new Error('연결 준비가 취소되었습니다.'))}
 private fail(s:string){this.managementVersion++;const wasLive=this.state.robot!==null;this.clear();this.output.cancel();this.update({connection:'disconnected',busy:false,scanning:false,robot:null,sensors:null,error:s});this.log(s)
 if(wasLive&&this.writer&&this.output.targets.length)void this.write(this.output.frame(modeZero())).catch(()=>{})
 }
 private async write(b:Uint8Array){
 const writer=this.writer,epoch=this.epoch
 if(!writer)throw new Error('동글이 연결되지 않았습니다.')
 const task=this.writeChain.then(async()=>{
 if(epoch!==this.epoch||writer!==this.writer)throw new Error('이전 연결의 전송이 취소되었습니다.')
 let timer:ReturnType<typeof setTimeout>|undefined
 try{await Promise.race([writer.write(b),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('USB 전송 시간 초과')),1500)})])}finally{clearTimeout(timer)}
 })
 this.writeChain=task.catch(()=>{});await task
 }
 private text(s:string){this.log('TX '+s);return this.write(new TextEncoder().encode(s+'\n'))}
 openDongle=async()=>{
 if(this.closing||this.state.busy||this.state.dongle)return
 const serial=this.serial??(typeof navigator!=='undefined'?navigator.serial:undefined)
 if(!serial)throw new Error('Chrome/Edge에서 localhost 또는 HTTPS로 실행하세요.')
 const epoch=++this.epoch;this.update({busy:true,error:'',message:'USB 동글 포트를 선택하세요.'})
 let port:SerialPort|undefined
 try{
 port=await serial.requestPort()
 if(epoch!==this.epoch)return
 await port.open({baudRate:115200,bufferSize:4096})
 if(epoch!==this.epoch){await port.close();return}
 if(!port.readable||!port.writable)throw new Error('USB 스트림을 열 수 없습니다.')
 this.port=port;this.writer=port.writable.getWriter();this.reader=port.readable.getReader();this.parser=new Parser(p=>this.packet(p))
 this.update({dongle:true,message:'동글 확인 중…'})
 this.reading=this.readLoop(epoch,this.reader)
 this.stale=setInterval(()=>{if(this.state.sensors&&Date.now()-this.sensorAt>2000){this.update({sensors:null,message:'센서 수신이 끊겨 출력을 정지합니다.'});void this.stop().catch(()=>{})}},500)
 // Reset an existing BLE session before starting discovery; STATUS can be queried without actuation.
 await new Promise(r=>setTimeout(r,350));if(epoch!==this.epoch)return
 this.timer=setTimeout(()=>this.fail('동글 응답이 없습니다. 동글 포트와 펌웨어를 확인하세요.'),2500)
 await this.text('DISCONNECT')
 }catch(e){if(epoch!==this.epoch)return;this.fail(e instanceof Error?e.message:String(e));await this.disconnect()}
 }
 // SDK connect resolves only when the user-selected robot acknowledges initialization.
 connect=async():Promise<boolean>=>{
 await this.openDongle()
 if(this.state.connection==='connected')return true
 if(!this.state.dongle||this.state.error)return false
 return new Promise(resolve=>{const unsubscribe=this.subscribe(()=>{
 if(this.state.connection==='connected'){unsubscribe();resolve(true)}
 else if(!this.state.dongle||this.state.error){unsubscribe();resolve(false)}
 })})
 }
 private async readLoop(epoch:number,reader:ReadableStreamDefaultReader<Uint8Array>){
 try{while(epoch===this.epoch){const {value,done}=await reader.read();if(done)break;if(value)this.parser.feed(value)}}
 catch(e){if(epoch===this.epoch)this.fail('USB 수신 오류: '+String(e))}
 finally{reader.releaseLock();if(epoch===this.epoch){this.update({sensors:null});void this.disconnect()}}
 }
 scan=async()=>{
 if(!this.state.dongle||this.state.robot||this.state.connection==='connecting')throw new Error('로봇 연결을 해제한 뒤 검색하세요.')
 this.clear();this.update({busy:true,scanning:true,robots:[],error:'',message:'로봇 검색 중… 약 4.5초'})
 this.timer=setTimeout(()=>this.fail('검색 완료 응답이 없습니다. 동글을 다시 연결하세요.'),7000)
 try{await this.text('SCAN')}catch(e){this.fail(String(e))}
 }
 selectRobot=async(id:number)=>{
 if(this.state.busy||!this.state.robots.some(r=>r.id===id)||this.state.robot)throw new Error('검색이 끝난 뒤 목록에서 로봇을 선택하세요.')
 this.clear();this.update({busy:true,connection:'connecting',robot:id,targets:[id],sensors:null,rxCount:0,error:'',message:`AI로봇집게+ ${id} 연결 중…`})
 this.timer=setTimeout(()=>this.fail('로봇 연결 응답 시간이 초과되었습니다.'),9500)
 try{await this.text('CONNECT '+id)}catch(e){this.fail(String(e))}
 }
 private packet(p:Packet){
 if(p.kind==='sensor'){
 if(this.state.robot && this.state.connection==='connected'){this.sensorAt=Date.now();this.update({sensors:{left:p.left,right:p.right,cm:p.cm},rxCount:this.state.rxCount+1,message:'초기화 확인 완료 · 센서 수신 중'})}return
 }
 if(p.kind==='status'){
 this.log(`모듈 응답 code=${p.code} robot=${p.robot} seq=${p.sequence} depth=${p.depth} age=${p.age}ms`)
 if(p.robot!==this.state.robot)return
 if(p.code===2&&this.pending?.seq===p.sequence){this.pending.acked=true;this.finishReset()}
 else if(p.code!==2){this.fail(`모듈 보호 정지(code ${p.code}). 동글 연결 해제 후 다시 연결하세요.`)}return
 }
 const s=p.text;this.log('RX '+s)
 if(s==='DISCONNECTED'){
 const initial=!this.closing&&this.state.busy&&!this.state.scanning&&this.state.robot===null
 this.clear();this.output.cancel();this.update({connection:'disconnected',robot:null,sensors:null,busy:false})
 if(initial)void this.scan();return
 }
 if(s==='SCAN_BEGIN')return
 if(s==='SCAN_DONE'){this.clear();this.update({scanning:false,busy:false,message:this.state.robots.length?'목록에서 사용할 로봇을 선택하세요.':'로봇이 없습니다. 전원을 확인한 뒤 다시 검색하세요.'});return}
 let m=s.match(/^ROBOT:(\d+):(-?\d+)$/)
 if(m&&this.state.scanning){const id=Number(m[1]);if(id>=1&&id<=20&&!this.state.robots.some(r=>r.id===id))this.update({robots:[...this.state.robots,{id,rssi:Number(m[2])}].sort((a,b)=>a.id-b.id)});return}
 m=s.match(/^BATTERY:(\d+):(\d+):(\d+):(\d+)$/)
 if(m&&this.state.scanning){const [id,battery,mv,batteryState]=m.slice(1).map(Number);if(battery<=100&&mv>=2000&&mv<=5500&&batteryState<=2)this.update({robots:this.state.robots.map(r=>r.id===id?{...r,battery,mv,batteryState}:r)});return}
 m=s.match(/^CONNECTED:(\d+)$/)
 if(m&&this.state.connection==='connecting'&&!this.pending&&Number(m[1])===this.state.robot){void this.reset(this.state.targets).catch(()=>{});return}
 if(/^(CONNECT_FAIL|SCAN_FAIL|ERR:)/.test(s))this.fail(s)
 }
 private async reset(targets:number[]){
 const epoch=this.epoch,operation=this.managementVersion;this.clear();this.output.cancel();await this.output.drain();if(epoch!==this.epoch||operation!==this.managementVersion)throw new Error('연결 준비가 취소되었습니다.')
 const frame=this.output.frame(modeZero(),[...new Set([...this.output.targets,...targets])]);const seq=frame[3]
 this.update({busy:true,message:'모듈 초기화 응답 확인 중… (MODE=0)'})
 return new Promise<void>((resolve,reject)=>{
 this.pending={seq,acked:false,written:false,settling:false,targets:[...targets],resolve,reject}
 this.timer=setTimeout(()=>this.fail('모듈 초기화 응답이 없습니다. 그룹 1 및 모듈 펌웨어를 확인하세요.'),2000)
 void this.write(frame).then(()=>{if(epoch!==this.epoch||this.pending?.seq!==seq)return;this.pending.written=true;this.finishReset()}).catch(e=>{if(epoch===this.epoch)this.fail(String(e))})
 })
 }
 private finishReset(){const p=this.pending;if(!p?.acked||!p.written||p.settling)return
 p.settling=true;clearTimeout(this.timer);const epoch=this.epoch
 // Multi-target MODE=0 needs the full prepare + commit interval before new work.
 this.timer=setTimeout(()=>{if(epoch!==this.epoch||this.pending!==p)return
 this.pending=undefined;this.output.configure(p.targets);this.update({connection:'connected',targets:p.targets,busy:false,message:'초기화 확인 완료 · 제어할 수 있습니다.'});p.resolve()
 },this.output.targets.length>1||p.targets.length>1?120:60)
 }
 setTargets=async(ids:number[])=>{
 if(this.state.connection!=='connected'||this.state.busy||!this.state.robot)throw new Error('로봇 연결을 먼저 확인하세요.')
 const targets=[...new Set([this.state.robot,...ids])].sort((a,b)=>a-b)
 if(targets.some(id=>!this.state.robots.some(r=>r.id===id)))throw new Error('검색된 로봇만 추가할 수 있습니다.')
 const operation=++this.managementVersion;this.update({busy:true,message:'기존 제어 대상 정지 후 대상을 변경합니다.'})
 try{await this.output.stop();if(operation!==this.managementVersion)throw new Error('대상 변경이 취소되었습니다.');await this.reset(targets);this.log('제어 대상: '+targets.join(', '))}catch(e){if(operation===this.managementVersion)this.fail(String(e));throw e}
 }
 private ready(){if(this.closing||this.state.busy||this.state.connection!=='connected')throw new Error('로봇 연결 및 초기화 확인이 필요합니다.');if(!this.state.sensors||Date.now()-this.sensorAt>2000)throw new Error('직접 연결된 로봇의 최신 센서 수신을 확인하세요.')}
 servo=async(channel:number,angle:number)=>{this.ready();await this.output.servo(channel,angle)}
 pixel=async(target:number,r:number,g:number,b:number)=>{this.ready();await this.output.pixel(target,r,g,b)}
 motor=async(direction:number,speed?:number)=>{this.ready();await this.output.motor(direction,speed)}
 moveFor=async(direction:number,seconds:number,speed?:number)=>{this.ready();await this.output.moveFor(direction,seconds,speed)}
 playNote=async(octave:number,note:number,seconds:number)=>{this.ready();await this.output.playNote(octave,note,seconds)}
 toneOff=async()=>{this.ready();await this.output.tone(0)}
 stop=async()=>{
 if(this.closing)return
 const operation=++this.managementVersion;this.clear();this.update({busy:true})
 try{await this.output.stop();if(operation===this.managementVersion)this.update({connection:this.state.connection==='connecting'?'disconnected':this.state.connection,message:'출력을 정지했습니다. 다음 제어 버튼을 누르면 새 명령을 실행합니다.'})}catch(e){this.fail(String(e));throw e}finally{if(operation===this.managementVersion)this.update({busy:false})}
 }
 pixelIndex=async(index:number,r:number,g:number,b:number)=>{
 if(!Number.isFinite(index)||Math.round(index)<1||Math.round(index)>4)throw new Error('LED 번호는 1~4입니다.')
 await this.pixel(Math.round(index)+2,r,g,b)
 }
 mapSensor=async(name:string,inMin:number,inMax:number,outMin:number,outMax:number)=>{
 if(![inMin,inMax,outMin,outMax].every(Number.isFinite)||inMin===inMax)throw new Error('입력 범위는 서로 다른 유한한 숫자여야 합니다.')
 const value=await this.sensor(name)
 const ratio=Math.max(0,Math.min(1,(value-inMin)/(inMax-inMin)))
 return outMin+ratio*(outMax-outMin)
 }
 monitorSensor=async(name:string)=>{
 await this.sensor(name)
 if(!this.state.monitors.includes(name))this.update({monitors:[...this.state.monitors,name]})
 }
 clearMonitors=async()=>{this.update({monitors:[]})}
 waitSeconds=async(seconds:number)=>{
 this.ready();if(!Number.isFinite(seconds)||seconds<0||seconds>3600)throw new Error('시간은 0~3600초입니다.')
 await new Promise<void>((resolve,reject)=>{
 const cancel=()=>{clearTimeout(timer);this.blockWaits.delete(cancel);reject(new Error('블록 대기가 취소되었습니다.'))}
 const timer=setTimeout(()=>{this.blockWaits.delete(cancel);resolve()},seconds*1000)
 this.blockWaits.add(cancel)
 })
 }
 moveForBlock=async(direction:number,seconds:number,speed?:number)=>{
 const version=this.managementVersion;await this.moveFor(direction,seconds,speed)
 if(version!==this.managementVersion)throw new Error('블록 이동이 취소되었습니다.')
 }
 playNoteBlock=async(octave:number,note:number,seconds:number)=>{
 const version=this.managementVersion;await this.playNote(octave,note,seconds)
 if(version!==this.managementVersion)throw new Error('블록 연주가 취소되었습니다.')
 }
 sensor=async(name:string)=>{if(this.state.connection!=='connected'||!this.state.sensors||Date.now()-this.sensorAt>2000)throw new Error('최신 센서값이 없습니다.');const s=this.state.sensors;if(name==='left')return s.left;if(name==='right')return s.right;if(name==='distance')return s.cm;throw new Error('센서 이름: left, right, distance')}
 disconnect=async()=>{
 if(this.closing)return
 this.closing=true;this.managementVersion++;this.update({busy:true});this.clear()
 try{if(this.writer){await this.output.stop();await this.text('DISCONNECT')}}catch{}
 ++this.epoch;this.clear();clearInterval(this.stale)
 const reader=this.reader,writer=this.writer,port=this.port,reading=this.reading
 this.reader=undefined;this.writer=undefined;this.port=undefined;this.reading=undefined
 this.update({connection:'disconnected',dongle:false,busy:true,scanning:false,robot:null,sensors:null,message:'연결 해제 중…'})
 try{await reader?.cancel()}catch{}
 try{await reading}catch{}
 try{await writer?.close()}catch{}
 try{writer?.releaseLock()}catch{}
 try{await port?.close()}catch{}
 this.output.configure([]);this.closing=false;this.update({targets:[],busy:false,message:'USB 동글 연결이 해제되었습니다.'})
 }
}
