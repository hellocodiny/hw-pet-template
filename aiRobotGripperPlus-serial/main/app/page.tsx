'use client'
import {Suspense,useEffect,useState} from 'react'
import {useSearchParams} from 'next/navigation'
import {Alert,Box,Button,Checkbox,Chip,FormControlLabel,MenuItem,Stack,TextField,Typography} from '@mui/material'
import {usePet} from '@repo/ui'
import {HW_ID,HW_NAME} from '@/constant'
import {CommandRunner} from '@/hw/CommandRunner'
import type {RobotStatus} from '@/hw/RobotController'
const jointNames=['상하','좌우','집게']
const presets: [string,number][][]=[[['위로',0],['가운데',90],['아래로',180]],[['왼쪽',180],['가운데',90],['오른쪽',0]],[['열기',0],['가운데',90],['닫기',180]]]
function Content(){
 const {commandRunner:runner}=usePet(HW_ID,CommandRunner,useSearchParams())
 const [state,setState]=useState<RobotStatus|null>(null),[error,setError]=useState(''),[supported,setSupported]=useState(true)
 const [angles,setAngles]=useState([90,90,90]),[direction,setDirection]=useState(1),[seconds,setSeconds]=useState(1),[speed,setSpeed]=useState(200),[variableSpeed,setVariableSpeed]=useState(false)
 const [pixel,setPixel]=useState(2),[colour,setColour]=useState('#3366ff'),[octave,setOctave]=useState(4),[note,setNote]=useState(9),[duration,setDuration]=useState(.5)
 useEffect(()=>{setSupported('serial' in navigator&&window.isSecureContext)},[])
 useEffect(()=>{if(!runner)return;setState(runner.getSnapshot());const timer=setInterval(()=>setState(runner.getSnapshot()),100)
 const hidden=()=>{if(document.hidden&&runner.getSnapshot().active)void runner.stop().catch(()=>{})}
 const leaving=()=>{void runner.disconnect()}
 document.addEventListener('visibilitychange',hidden);window.addEventListener('pagehide',leaving)
 return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('pagehide',leaving)}},[runner])
 const run=(f:()=>Promise<unknown>)=>{setError('');void f().catch(e=>setError(String(e)))}
 const ready=Boolean(runner&&state?.connection==='connected'&&!state.busy&&state.sensors)
 const applyColour=()=>{if(!runner)return;const rgb=[1,3,5].map(i=>parseInt(colour.slice(i,i+2),16));const max=Math.max(...rgb);run(()=>runner.pixel(pixel,...rgb.map(v=>max?Math.round(v/max*100):0) as [number,number,number]))}
 return <Box sx={{maxWidth:900,mx:'auto',p:2}}>
 <Typography component="h1" variant="h5">{HW_NAME.ko}</Typography>
 <Typography color="text.secondary" sx={{mb:2}}>AI코디니 · 3단계 블록 연동 · 다중 로봇 제어</Typography>
 <Alert severity="info">먼저 함께 사용할 로봇을 모두 켜고 검색하세요. 직접 연결된 1대가 선택한 로봇에 제어 명령을 중계합니다.</Alert>
 {!supported&&<Alert severity="warning">PC Chrome/Edge에서 localhost 또는 HTTPS로 실행하세요.</Alert>}
 <Stack direction="row" flexWrap="wrap" gap={1} sx={{my:2}}>
 <Button disabled={!runner||state?.busy||state?.dongle||!supported} onClick={()=>runner&&run(()=>runner.openDongle())} variant="contained">USB 동글 연결</Button>
 <Button disabled={!runner||!state?.dongle||state?.busy||Boolean(state?.robot)} onClick={()=>runner&&run(()=>runner.scan())} variant="outlined">로봇 다시 검색</Button>
 <Button disabled={!runner||(!state?.dongle&&!state?.busy)} onClick={()=>runner&&run(()=>runner.disconnect())}>연결 해제</Button>
 <Button color="error" disabled={!runner||!state?.robot} onClick={()=>runner&&run(()=>runner.stop())} variant="contained">전체 출력 정지</Button>
 </Stack>
 <Stack direction="row" flexWrap="wrap" gap={1} sx={{mb:2}}><Chip label={state?.dongle?'동글 열림':'동글 닫힘'}/><Chip color={state?.connection==='connected'?'success':'default'} label={state?.connection==='connected'?'로봇 초기화 확인됨':state?.connection==='connecting'?'로봇 연결 확인 중':'로봇 연결 안 됨'}/><Chip label={`제어 대상 ${state?.targets.length??0}대`}/></Stack>
 <Typography>{state?.message||'화면 준비 중…'}</Typography>
 {Boolean(error||state?.error)&&<Alert severity="error" sx={{my:1}}>{error||state?.error}</Alert>}
 <Typography sx={{mt:3}} variant="h6">연결할 로봇 / 함께 제어할 로봇</Typography>
 <Typography color="text.secondary" variant="body2">같은 그룹(1), 서로 다른 로봇 번호를 사용하세요. 체크는 제어 대상 선택이며 추가 로봇의 현재 연결 여부를 확인한 표시는 아닙니다. 대상 변경 시 기존 출력이 정지됩니다.</Typography>
 {state?.robots.map(r=><Box key={r.id} sx={{border:'1px solid #ccd5df',borderRadius:2,p:1.5,my:1}}>
 <Stack alignItems="center" direction="row" flexWrap="wrap" gap={1}>
 <Typography>AI로봇집게+ {r.id}</Typography>
 {state.robot===r.id&&<Chip color="primary" label="직접 연결 · 센서 수신" size="small"/>}
 {state.connection==='connected'?<FormControlLabel control={<Checkbox checked={state.targets.includes(r.id)} disabled={state.busy||state.robot===r.id} onChange={(_,checked)=>runner&&run(()=>runner.setTargets(checked?[...state.targets,r.id]:state.targets.filter(id=>id!==r.id)))}/>} label={state.robot===r.id?'필수 제어 대상':'함께 제어'}/>:<Button disabled={state.busy||Boolean(state.robot)} onClick={()=>runner&&run(()=>runner.selectRobot(r.id))}>이 로봇 연결</Button>}
 </Stack>
 <Typography color="text.secondary" variant="body2">검색 당시 신호 {r.rssi} dBm · 배터리 {r.battery===undefined?'정보 없음':`${r.battery}% · ${(r.mv!/1000).toFixed(2)} V · ${['정상','주의','위험'][r.batteryState!]}`}</Typography>
 </Box>)}
 <Typography color="text.secondary" variant="body2">연결 중 새 검색은 지원하지 않습니다. 나중에 켠 로봇은 연결 해제 후 다시 검색하세요. 배터리는 검색 당시 정보입니다.</Typography>
 <Alert severity="warning" sx={{mt:2}}>아래 제어는 선택된 모든 로봇에 적용됩니다. 관절 기본 명령값은 90°이며, 첫 일반 제어 명령에서 세 관절이 이 값으로 움직일 수 있습니다.</Alert>
 <Typography sx={{mt:3,mb:1}} variant="h6">바퀴 이동</Typography>
 <Stack alignItems="center" direction="row" flexWrap="wrap" gap={1}>
 <TextField disabled={!ready} label="방향" onChange={e=>setDirection(Number(e.target.value))} select size="small" value={direction}>{[[1,'전진'],[2,'후진'],[3,'좌회전'],[4,'우회전']].map(([id,label])=><MenuItem key={id} value={id}>{label}</MenuItem>)}</TextField>
 <TextField disabled={!ready} inputProps={{min:0,max:3600,step:.1}} label="시간(초)" onChange={e=>setSeconds(Number(e.target.value))} size="small" sx={{width:115}} type="number" value={seconds}/>
 <FormControlLabel control={<Checkbox checked={Boolean(variableSpeed&&direction!==2)} disabled={!ready||direction===2} onChange={(_,v)=>setVariableSpeed(v)}/>} label="속도 지정"/>
 <TextField disabled={!ready||!variableSpeed||direction===2} inputProps={{min:0,max:255}} label="속도 0~255" onChange={e=>setSpeed(Number(e.target.value))} size="small" sx={{width:130}} type="number" value={speed}/>
 <Button disabled={!ready} onClick={()=>runner&&run(()=>runner.moveFor(direction,seconds,variableSpeed&&direction!==2?speed:undefined))} variant="contained">지정 시간 이동</Button>
 <Button disabled={!ready} onClick={()=>runner&&run(()=>runner.motor(direction,variableSpeed&&direction!==2?speed:undefined))} variant="outlined">계속 이동</Button>
 <Button disabled={!ready} onClick={()=>runner&&run(()=>runner.motor(0))}>바퀴 정지</Button>
 </Stack>
 <Typography color="text.secondary" variant="body2">후진은 기존 펌웨어의 고정 속도를 사용합니다. 계속 이동은 바퀴 정지 또는 전체 출력 정지까지 유지합니다.</Typography>
 <Typography sx={{mt:3}} variant="h6">관절 제어</Typography>
 {jointNames.map((name,i)=><Stack alignItems="center" direction="row" flexWrap="wrap" gap={1} key={name} sx={{my:1}}>
 <Typography sx={{minWidth:40}}>{name}</Typography>
 {presets[i].map(([label,angle])=><Button disabled={!ready} key={label} onClick={()=>runner&&run(()=>runner.servo(i+1,angle))} variant="outlined">{label}</Button>)}
 <TextField disabled={!ready} inputProps={{min:0,max:180}} label="각도 0~180" onChange={e=>setAngles(angles.map((a,j)=>j===i?Number(e.target.value):a))} size="small" sx={{width:130}} type="number" value={angles[i]}/>
 <Button disabled={!ready} onClick={()=>runner&&run(()=>runner.servo(i+1,angles[i]))}>각도 적용</Button>
 <Typography variant="body2">명령값 {state?.output?.angles[i]??90}°</Typography>
 </Stack>)}
 <Typography sx={{mt:3,mb:1}} variant="h6">네오픽셀</Typography>
 <Stack alignItems="center" direction="row" flexWrap="wrap" gap={1}>
 <TextField disabled={!ready} label="LED" onChange={e=>setPixel(Number(e.target.value))} select size="small" value={pixel}>{[[2,'전체'],[0,'왼쪽 묶음'],[1,'오른쪽 묶음'],[3,'1번'],[4,'2번'],[5,'3번'],[6,'4번']].map(([id,label])=><MenuItem key={id} value={id}>{label}</MenuItem>)}</TextField>
 <label>색상 <input aria-label="네오픽셀 색상" disabled={!ready} onChange={e=>setColour(e.target.value)} type="color" value={colour}/></label>
 <Button disabled={!ready} onClick={applyColour} variant="contained">색 적용</Button>
 <Button disabled={!ready} onClick={()=>runner&&run(()=>runner.pixel(2,0,0,0))}>LED 모두 끄기</Button>
 </Stack>
 <Typography color="text.secondary" variant="body2">PC 프로그램처럼 선택 색상의 최대 RGB 성분을 100으로 맞춥니다. 배터리 경고 LED는 펌웨어가 우선 제어합니다.</Typography>
 <Typography sx={{mt:3,mb:1}} variant="h6">부저</Typography>
 <Stack alignItems="center" direction="row" flexWrap="wrap" gap={1}>
 <TextField disabled={!ready} label="옥타브" onChange={e=>setOctave(Number(e.target.value))} select size="small" value={octave}>{[2,3,4,5,6].map(v=><MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField>
 <TextField disabled={!ready} label="음계" onChange={e=>setNote(Number(e.target.value))} select size="small" value={note}>{[[0,'도'],[2,'레'],[4,'미'],[5,'파'],[7,'솔'],[9,'라'],[11,'시']].map(([v,label])=><MenuItem key={v} value={v}>{label}</MenuItem>)}</TextField>
 <TextField disabled={!ready} inputProps={{min:0,max:3600,step:.1}} label="시간(초)" onChange={e=>setDuration(Number(e.target.value))} size="small" sx={{width:115}} type="number" value={duration}/>
 <Button disabled={!ready} onClick={()=>runner&&run(()=>runner.playNote(octave,note,duration))} variant="contained">연주</Button>
 <Button disabled={!ready} onClick={()=>runner&&run(()=>runner.toneOff())}>소리 끄기</Button>
 </Stack>
 <Typography color="text.secondary" variant="body2">펌웨어 최대 주파수는 2040Hz입니다. 이를 넘는 높은 음은 같은 최대 음높이로 제한됩니다.</Typography>
 <Typography sx={{mt:3}} variant="h6">센서 · 직접 연결된 {state?.robot??'—'}번 로봇</Typography>
 <Typography>왼쪽 적외선: {state?.sensors?.left??'—'} / 오른쪽 적외선: {state?.sensors?.right??'—'}</Typography>
 <Typography>초음파 거리: {state?.sensors?`${state.sensors.cm} cm`:'—'}</Typography>
 <Typography color="text.secondary" variant="body2">추가 로봇의 센서값은 수신하지 않습니다. 2초 이상 수신이 없으면 오래된 값을 숨기고 출력을 정지합니다.</Typography>
 <Typography>센서 수신: {state?.rxCount??0}회</Typography>
 <Typography sx={{mt:3}} variant="h6">블록 센서 모니터 · 직접 연결된 {state?.robot??'—'}번</Typography>
 <Stack direction="row" flexWrap="wrap" gap={1}>
 {state?.monitors.map(name=><Chip key={name} label={`${({left:'왼쪽 적외선',right:'오른쪽 적외선',distance:'초음파 거리'} as Record<string,string>)[name]}: ${state.sensors?state.sensors[name==='distance'?'cm':name as 'left'|'right']:'—'}`}/>)}
 </Stack>
 <Typography color="text.secondary" variant="body2">센서 표시 블록으로 추가한 값입니다. 코디니 무대가 아닌 이 교구창에 표시합니다.</Typography>
 <Button disabled={!state?.monitors.length} onClick={()=>runner&&run(()=>runner.clearMonitors())}>센서 표시 지우기</Button>
 <Typography sx={{mt:3}} variant="h6">연결 로그</Typography>
 <Box component="pre" sx={{p:1.5,bgcolor:'#f2f5f9',fontSize:12,whiteSpace:'pre-wrap',overflowWrap:'anywhere',maxHeight:260,overflow:'auto'}}>{state?.log.join('\n')||'연결 로그가 여기에 표시됩니다.'}</Box>
 </Box>
}
export default function Page(){return <Suspense fallback={<p>불러오는 중…</p>}><Content/></Suspense>}
