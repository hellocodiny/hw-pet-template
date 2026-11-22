/** USB dongle ASCII + Nano sensor + module diagnostic stream. */
export type Packet = {kind:'line';text:string}|{kind:'sensor';left:number;right:number;cm:number}|{kind:'status';code:number;robot:number;sequence:number;depth:number;age:number}
export function crc8(bytes: ArrayLike<number>) { let c=0; for(let i=0;i<bytes.length;i++){c^=bytes[i];for(let j=0;j<8;j++)c=((c&128)?(c<<1)^7:c<<1)&255}return c }
export function resetFrame(id:number,sequence:number,group=1){
 if(!Number.isInteger(id)||id<1||id>20)throw new Error('로봇 번호 오류')
 if(!Number.isInteger(group)||group<1||group>255)throw new Error('그룹 번호 오류')
 const mask=1<<(id-1);const b=Uint8Array.from([254,239,group,sequence&255,mask&255,(mask>>8)&255,(mask>>16)&255,255,85,0,0,0,0,0,0,0,0,0,0,0]);b[19]=crc8(b.slice(2,19));return b
}
export class Parser {
 private buffer:number[]=[]
 private line=''
 constructor(private emit:(p:Packet)=>void){}
 feed(bytes:Uint8Array){
 this.buffer.push(...bytes)
 while(this.buffer.length){
 const a=this.buffer
 if(a[0]===255||a[0]===254){
  if(a.length<2)break
  const n=a[0]===255&&a[1]===85?7:a[0]===254&&a[1]===236?10:0
  if(n){if(a.length<n)break
   if(n===7 && a[2]<=1 && a[3]===0 && a[4]<=1){this.emit({kind:'sensor',left:a[2],right:a[4],cm:a[5]|a[6]<<8});a.splice(0,n);continue}
   if(n===10 && a[2]===1 && [1,2,3].includes(a[3]) && crc8(a.slice(2,9))===a[9]){this.emit({kind:'status',code:a[3],robot:a[4],sequence:a[5],depth:a[6],age:a[7]*256+a[8]});a.splice(0,n);continue}
  }
  a.shift();this.line='';continue
 }
 const v=a.shift()!
 if(v===10||v===13){if(this.line)this.emit({kind:'line',text:this.line});this.line=''}
 else if(v>=32&&v<=126){this.line+=String.fromCharCode(v);if(this.line.length>200)this.line=''}
 else this.line=''
 }
 }
}

export type OutputState={angles:number[];pixel:number;rgb:number[];tone:number;motor:number;pwm:number|null}
export const initialOutput=():OutputState=>({angles:[90,90,90],pixel:2,rgb:[0,0,0],tone:0,motor:0,pwm:null})
export function relayFrame(ids:number[],sequence:number,command:ArrayLike<number>){
 if(command.length!==12||!ids.length)throw new Error('중계 패킷 오류')
 let mask=0
 for(const id of ids){if(!Number.isInteger(id)||id<1||id>20)throw new Error('로봇 번호 오류');mask|=1<<(id-1)}
 const b=Uint8Array.from([254,239,1,sequence&255,mask&255,mask>>8&255,mask>>16&255,...Array.from(command),0]);b[19]=crc8(b.slice(2,19));return b
}
export function commandFrame(s:OutputState){return Uint8Array.from([255,85,1,...s.angles,s.pixel,...s.rgb,Math.round(s.tone/8),s.pwm===null?s.motor:255])}
export const modeZero=()=>Uint8Array.from([255,85,0,0,0,0,0,0,0,0,0,0])
export function numberIn(value:number,min:number,max:number){if(!Number.isFinite(value)||value<min||value>max)throw new Error(`${min}~${max} 범위의 숫자를 입력하세요.`);return value}
