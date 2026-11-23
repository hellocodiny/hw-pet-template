const {test}=require('node:test');const assert=require('node:assert/strict');
const {Parser,crc8,resetFrame}=require('../.test-build/protocol');
const {RobotController}=require('../.test-build/RobotController');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const status=(seq=0,robot=1,code=2)=>{const b=[254,236,1,code,robot,seq,0,0,0,0];b[9]=crc8(b.slice(2,9));return b};
test('reset frame exactly matches PC relay function for IDs 1 and 20',()=>{
 for(const id of [1,20]){const b=resetFrame(id,257);assert.equal(b.length,20);assert.deepEqual([...b.slice(0,4)],[254,239,1,1]);assert.equal(b[4]|b[5]<<8|b[6]<<16,1<<(id-1));assert.deepEqual([...b.slice(7,19)],[255,85,0,0,0,0,0,0,0,0,0,0]);assert.equal(b[19],crc8(b.slice(2,19)))}
 assert.throws(()=>resetFrame(21,0));
});
test('every split of mixed ASCII, diagnostic and sensor frames',()=>{
 const bytes=Uint8Array.from([...Buffer.from('SCAN_BEGIN\r\nROBOT:1:-40\n'),...status(),255,85,0,0,1,42,0,...Buffer.from('SCAN_DONE\n')]);
 for(let i=0;i<=bytes.length;i++){const out=[];const p=new Parser(x=>out.push(x));p.feed(bytes.slice(0,i));p.feed(bytes.slice(i));assert.equal(out.length,5);assert.equal(out[2].code,2);assert.equal(out[3].cm,42);assert.equal(out[4].text,'SCAN_DONE')}
});
test('bad CRC and noise do not produce a module acknowledgement',()=>{const out=[],p=new Parser(x=>out.push(x)),b=status();b[9]^=1;p.feed(Uint8Array.from([0,200,...b,255,85,1,0,0,12,0]));assert.equal(out.filter(p=>p.kind==='status').length,0);assert.equal(out.filter(p=>p.kind==='sensor').length,1)});
function mock(){let feed;const writes=[];let closes=0;
 const port={readable:new ReadableStream({start(c){feed=b=>c.enqueue(Uint8Array.from(b))}}),writable:new WritableStream({write(b){writes.push([...b]);const s=Buffer.from(b).toString();if(s==='DISCONNECT\n')feed(Buffer.from('DISCONNECTED\n'));if(s==='SCAN\n')feed(Buffer.from('SCAN_BEGIN\nROBOT:1:-40\nBATTERY:1:70:3900:0\nSCAN_DONE\n'));if(s==='CONNECT 1\n')feed(Buffer.from('CONNECTED:1\n'))}}),open:async()=>{},close:async()=>{closes++}};
 return{port,writes,feed:b=>feed(b),closes:()=>closes}}
test('discovery, matching ACK, sensor updates and cleanup; only MODE=0 sent',async()=>{
 const m=mock(),r=new RobotController({requestPort:async()=>m.port});
 try{await r.openDongle();await wait(10);assert.equal(r.getSnapshot().robots[0].battery,70);await r.selectRobot(1);await wait(10);
 m.feed(status(7));await wait(5);assert.equal(r.getSnapshot().connection,'connecting');
 m.feed(status(0,2));await wait(5);assert.equal(r.getSnapshot().connection,'connecting');
 m.feed(status());await wait(80);assert.equal(r.getSnapshot().connection,'connected');
 m.feed([255,85,0,0,1,25,0]);await wait(5);assert.equal(await r.sensor('distance'),25);
 m.feed([255,85,1,0,0,40,0]);await wait(5);assert.equal(await r.sensor('distance'),40);
 assert.equal(m.writes.filter(b=>b[0]===254).length,1);assert.equal(m.writes.find(b=>b[0]===254)[9],0);
 }finally{await r.disconnect()}assert.equal(m.closes(),1);await assert.rejects(r.sensor('distance'));
});
test('missing reset acknowledgement fails without actuator writes',async()=>{
 const m=mock(),r=new RobotController({requestPort:async()=>m.port});try{await r.openDongle();await wait(5);await r.selectRobot(1);await wait(2100);assert.equal(r.getSnapshot().connection,'disconnected');assert.match(r.getSnapshot().error,/初|초기화/);assert.equal(m.writes.filter(b=>b[0]===254).length,1)}finally{await r.disconnect()}
});
test('cancelling while port open is pending closes the late port',async()=>{const m=mock();let ready;m.port.open=()=>new Promise(r=>ready=r);const r=new RobotController({requestPort:async()=>m.port});const connecting=r.openDongle();await wait(5);await r.disconnect();ready();await connecting;assert.equal(m.closes(),1);assert.equal(m.writes.length,0)});
test('SDK reports success only after module ACK; stale sensor values are unavailable',async()=>{
 const m=mock(),r=new RobotController({requestPort:async()=>m.port});let connected=false;const operation=r.connect().then(v=>{connected=v;return v});
 try{await wait(400);assert.equal(connected,false);await r.selectRobot(1);await wait(5);m.feed(status());assert.equal(await operation,true);m.feed([255,85,0,0,1,9,0]);await wait(5);assert.equal(await r.sensor('distance'),9);await wait(2200);await assert.rejects(r.sensor('distance'));assert.equal(r.getSnapshot().sensors,null)}finally{await r.disconnect()}
});
test('module protection notification clears connection and sensors',async()=>{
 const m=mock(),r=new RobotController({requestPort:async()=>m.port});try{await r.openDongle();await wait(5);await r.selectRobot(1);await wait(5);m.feed(status());await wait(70);m.feed(status(1,1,3));await wait(5);assert.equal(r.getSnapshot().connection,'disconnected');assert.match(r.getSnapshot().error,/보호 정지/)}finally{await r.disconnect()}
});
const {ControlOutput}=require('../.test-build/ControlOutput');
const {commandFrame,relayFrame,initialOutput}=require('../.test-build/protocol');
test('relay selection encodes robot 1, 3 and 20 with CRC',()=>{const b=relayFrame([1,3,20],9,commandFrame(initialOutput()));assert.equal(b[4]|b[5]<<8|b[6]<<16,0x80005);assert.equal(b[19],crc8(b.slice(2,19)))});
function outputMock(ids=[1]){const writes=[];let errors=[];const tx=new ControlOutput(async b=>{writes.push({b:[...b],at:Date.now()})},()=>{},e=>errors.push(e));tx.configure(ids);return{tx,writes,errors}}
test('servo/LED/tone preserve PWM, physical LED and direction mappings',async()=>{
 const {tx,writes}=outputMock();try{
 await tx.motor(3,125);assert.deepEqual(writes.at(-1).b.slice(7,19),[255,85,165,125,0,0,0,0,0,0,0,3]);
 await tx.servo(1,0);assert.equal(writes.at(-1).b[10],0);assert.equal(writes.at(-1).b[18],255);
 await tx.pixel(6,10,20,30);assert.deepEqual(writes.at(-1).b.slice(13,17),[6,10,20,30]);assert.equal(writes.at(-1).b[18],255);
 await tx.motor(0);assert.equal(writes.at(-1).b[18],0);
 await tx.pixel(2,0,0,0);assert.deepEqual(writes.at(-1).b.slice(13,17),[2,0,0,0]);
 await assert.rejects(tx.motor(2,100));await assert.rejects(tx.servo(1,NaN));
 }finally{tx.cancel()}
});
test('multi-robot normal commands are paced and heartbeat keeps long tones alive',async()=>{
 const {tx,writes}=outputMock([1,2]);try{
 await tx.pixel(3,100,0,0);await tx.pixel(4,0,100,0);assert.ok(writes[1].at-writes[0].at>=100);
 await tx.tone(440);await wait(650);assert.ok(writes.filter(w=>w.b[17]===55).length>=2);
 assert.equal(tx.state.tone,440)
 }finally{tx.cancel()}
});
test('stop cancels timed movement and note without delayed resurrection',async()=>{
 const {tx,writes}=outputMock([1,2]);try{
 const moving=tx.moveFor(1,5);await wait(140);const playing=tx.playNote(4,9,5);await wait(140);await tx.stop();await Promise.all([moving,playing]);
 const n=writes.length;assert.equal(writes.at(-1).b[9],0);assert.equal(writes.at(-2).b[13],2);assert.deepEqual(writes.at(-2).b.slice(14,18),[0,0,0,0]);await wait(450);assert.equal(writes.length,n);assert.equal(tx.active,false)
 }finally{tx.cancel()}
});
test('older timed movement cannot stop a newer movement',async()=>{
 const {tx}=outputMock();try{const moving=tx.moveFor(1,.15);await wait(60);await tx.motor(2);await moving;assert.equal(tx.state.motor,2)}finally{tx.cancel()}
});
test('timed note sends A4 then off after requested duration',async()=>{
 const {tx,writes}=outputMock();try{await tx.playNote(4,9,.1);assert.equal(writes[0].b[17],55);assert.equal(writes.at(-1).b[17],0);assert.ok(writes.at(-1).at-writes[0].at>=95)}finally{tx.cancel()}
});
function multiMock(){const m=mock();const original=m.port.writable;let ack=true;
 // Replace the writable with deterministic dongle replies and real packet sequence ACKs.
 m.port.writable=new WritableStream({write(b){m.writes.push([...b]);const s=Buffer.from(b).toString();if(s==='DISCONNECT\n')m.feed(Buffer.from('DISCONNECTED\n'));if(s==='SCAN\n')m.feed(Buffer.from('SCAN_BEGIN\nROBOT:1:-40\nROBOT:2:-50\nROBOT:3:-60\nSCAN_DONE\n'));if(s==='CONNECT 1\n')m.feed(Buffer.from('CONNECTED:1\n'));if(b[0]===254&&b[9]===0&&ack)m.feed(status(b[3]));}});
 return {...m,setAck:v=>{ack=v}}
}
async function linked(m){const r=new RobotController({requestPort:async()=>m.port});await r.openDongle();await wait(5);await r.selectRobot(1);await wait(85);m.feed([255,85,0,0,1,20,0]);await wait(5);return r}
test('adding/removing targets stops old selection; relay always included',async()=>{
 const m=multiMock(),r=await linked(m);try{
 await r.setTargets([2]);assert.deepEqual(r.getSnapshot().targets,[1,2]);await r.motor(1);const before=m.writes.length;await r.setTargets([3]);const frames=m.writes.slice(before).filter(b=>b[0]===254);assert.equal(frames[0][4],3);assert.equal(frames[0][18],0);assert.ok(frames.some(b=>b[9]===0&&b[4]===7));assert.deepEqual(r.getSnapshot().targets,[1,3]);assert.equal(r.getSnapshot().active,false);await assert.rejects(r.setTargets([20]));
 }finally{await r.disconnect()}
});
test('stop during target reset cancels pending selection and late ACK',async()=>{
 const m=multiMock(),r=await linked(m);try{
 m.setAck(false);const change=r.setTargets([2]).catch(()=>{});await wait(30);const frame=m.writes.filter(b=>b[0]===254).at(-1);await r.stop();m.feed(status(frame[3]));await change;await wait(150);assert.deepEqual(r.getSnapshot().targets,[1]);assert.equal(r.getSnapshot().active,false)
 }finally{await r.disconnect()}
});
test('sensor mapping clamps, reverses and preserves fractions; monitors do not duplicate',async()=>{
 const m=multiMock(),r=await linked(m);try{
 assert.equal(await r.mapSensor('distance',5,50,0,180),60);
 assert.equal(await r.mapSensor('distance',50,5,0,180),120);
 assert.equal(await r.mapSensor('distance',0,100,0,1),.2);
 assert.equal(await r.mapSensor('distance',30,50,0,180),0);
 await assert.rejects(r.mapSensor('distance',5,5,0,180));await assert.rejects(r.mapSensor('distance',NaN,5,0,180));
 await r.monitorSensor('distance');await r.monitorSensor('distance');assert.deepEqual(r.getSnapshot().monitors,['distance']);await r.clearMonitors();assert.deepEqual(r.getSnapshot().monitors,[]);
 await r.pixelIndex(3,100,0,0);assert.equal(m.writes.filter(b=>b[0]===254).at(-1)[13],5);await assert.rejects(r.pixelIndex(5,0,0,0));
 }finally{await r.disconnect()}
});
test('hardware stop rejects block wait and prevents following generated commands',async()=>{
 const m=multiMock(),r=await linked(m);try{let continued=false;const sequence=(async()=>{await r.waitSeconds(10);continued=true})().catch(e=>e);await wait(20);await r.stop();const error=await sequence;assert.ok(error instanceof Error);assert.equal(continued,false)}finally{await r.disconnect()}
});
test('hardware stop rejects timed block movement instead of continuing the sequence',async()=>{
 const m=multiMock(),r=await linked(m);try{const movement=r.moveForBlock(1,10).catch(e=>e);await wait(50);await r.stop();assert.ok(await movement instanceof Error)}finally{await r.disconnect()}
});
