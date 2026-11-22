const {test}=require('node:test');
const assert=require('node:assert/strict');
const {SensorParser,defaultOutput,packet,stopOutput,scaleSensor,integer}=require('../.test-build/protocol.js');
const {RobotController}=require('../.test-build/RobotController.js');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const timing={settle:20,handshake:150,stale:200,write:80};
class FakePort {
 constructor({silent=false,failOpen=false,failWrite=false}={}){Object.assign(this,{silent,failOpen,failWrite});this.writes=[];this.openCount=0;this.closeCount=0;this.readable=null;this.writable=null;}
 async open(options){
  this.openCount++;assert.equal(options.baudRate,115200);
  if(this.failOpen)throw new Error('Port in use');
  this.readable=new ReadableStream({start:c=>{this.controller=c},cancel:()=>clearInterval(this.interval)});
  this.writable=new WritableStream({write:b=>{if(this.failWrite)throw new Error('Write failed');this.writes.push(Array.from(b))}});
  if(!this.silent)this.interval=setInterval(()=>this.controller.enqueue(Uint8Array.from([255,85,0,64,128,192,255])),8);
 }
 async close(){clearInterval(this.interval);this.closeCount++;this.readable=null;this.writable=null;}
 unplug(){clearInterval(this.interval);this.controller.error(new Error('unplugged'));}
}
function fixture(options){let port=new FakePort(options);const serial=new EventTarget();serial.requestPort=async()=>port;const robot=new RobotController(()=>serial,timing);return {robot,port,serial,setPort:p=>port=p};}

test('parser handles every split, embedded header, coalesced frames and noise',()=>{
 const bytes=[4,99,255,255,85,255,85,0,128,255,255,85,1,2,3,4,5];
 for(let split=0;split<=bytes.length;split++){
  const p=new SensorParser();assert.deepEqual([...p.push(Uint8Array.from(bytes.slice(0,split))),...p.push(Uint8Array.from(bytes.slice(split)))],[[255,85,0,128,255],[1,2,3,4,5]]);
 }
 const p=new SensorParser();let frames=[];for(const b of bytes)frames.push(...p.push(Uint8Array.of(b)));assert.equal(frames.length,2);
 p.push(new Uint8Array(100000));assert.ok(p.bytes.length<7);
});
test('exact default TX, per-LED persistence, stop and scaling',()=>{
 const s=defaultOutput();assert.deepEqual([...packet(s,0)],[255,85,1,90,90,90,2,0,0,0,0,0]);
 s.angles=[20,30,40];s.pixels=[[255,0,0],[0,255,0]];s.blue=128;s.buzzer=55;
 assert.deepEqual([...packet(s,0)].slice(6,10),[0,255,0,0]);assert.deepEqual([...packet(s,1)].slice(6,10),[1,0,255,0]);
 stopOutput(s);assert.deepEqual([...packet(s,0)],[255,85,1,20,30,40,2,0,0,0,0,0]);
 assert.deepEqual([scaleSensor(0),scaleSensor(128),scaleSensor(255)],[0,514,1023]);assert.throws(()=>integer(NaN,0,180));
});
test('connect, output state, stop heartbeat, resume, disconnect and reconnect',async()=>{
 const f=fixture();const {robot,port}=f;
 try{
  const opening=robot.connect();assert.equal(await robot.connect(),true);assert.equal(await opening,true);assert.equal(port.openCount,1);
  assert.deepEqual(robot.getSnapshot().sensors,[0,257,514,770,1023]);
  await robot.servo(1,33);await robot.servo(2,999);await robot.tone(440);await robot.blue(128);
  await robot.pixel(0,255,0,0);await robot.pixel(1,0,255,0);await wait(80);
  assert.ok(port.writes.some(p=>p[6]===0&&p[7]===255));assert.ok(port.writes.some(p=>p[6]===1&&p[8]===255));
  assert.ok(port.writes.every(p=>p.length===12&&p[2]===1));
  await robot.stop();assert.deepEqual(port.writes.at(-1),[255,85,1,33,180,90,2,0,0,0,0,0]);
  const count=port.writes.length;await wait(75);assert.ok(port.writes.length>count);await assert.rejects(robot.servo(1,1),/정지/);
  await robot.start();await robot.servo(1,44);await robot.disconnect();assert.equal(port.closeCount,1);assert.equal(robot.getSnapshot().sensors,null);
  const after=port.writes.length;await wait(60);assert.equal(port.writes.length,after);
  const second=new FakePort();f.setPort(second);assert.equal(await robot.connect(),true);assert.deepEqual(second.writes[0].slice(3,6),[90,90,90]);
  await assert.rejects(robot.sensor(5));await assert.rejects(robot.servo(1,Infinity));
 }finally{await robot.disconnect();}
});
test('no sensor handshake means no control writes',async()=>{
 const {robot,port}=fixture({silent:true});assert.equal(await robot.connect(),false);assert.equal(robot.getSnapshot().connection,'disconnected');
 // No commands, including shutdown, to an unverified port.
 assert.equal(port.writes.length,0);assert.equal(port.closeCount,1);assert.match(robot.getSnapshot().error,/센서 응답/);
});
test('port busy and cancelled picker are recoverable',async()=>{
 const f=fixture({failOpen:true});assert.equal(await f.robot.connect(),false);assert.match(f.robot.getSnapshot().error,/Port in use/);
 f.serial.requestPort=async()=>{throw new DOMException('cancel','NotFoundError')};assert.equal(await f.robot.connect(),false);assert.equal(f.robot.getSnapshot().error,'');
});
test('disconnect while picker open prevents late port open',async()=>{
 const f=fixture();let pick;f.serial.requestPort=()=>new Promise(r=>{pick=r});const opening=f.robot.connect();await f.robot.disconnect();pick(f.port);
 assert.equal(await opening,false);assert.equal(f.port.openCount,0);
});
test('unplug clears stale sensor values and stops TX',async()=>{
 const {robot,port}=fixture();await robot.connect();port.unplug();await wait(100);
 assert.equal(robot.getSnapshot().connection,'disconnected');assert.equal(robot.getSnapshot().sensors,null);const count=port.writes.length;await wait(60);assert.equal(port.writes.length,count);
});
test('stale sensor data disconnects; cannot read old values',async()=>{
 const {robot,port}=fixture();await robot.connect();clearInterval(port.interval);await wait(300);
 assert.equal(robot.getSnapshot().connection,'disconnected');assert.equal(robot.getSnapshot().sensors,null);await assert.rejects(robot.sensor(0));
});
test('write failure closes connection and can reconnect',async()=>{
 const f=fixture({failWrite:true});assert.equal(await f.robot.connect(),false);assert.equal(f.robot.getSnapshot().connection,'disconnected');
 const second=new FakePort();f.setPort(second);assert.equal(await f.robot.connect(),true);await f.robot.disconnect();
});
test('disconnect during port open closes a late opened port exactly once',async()=>{
 const f=fixture();const original=f.port.open.bind(f.port);let release;
 f.port.open=async options=>{await new Promise(r=>{release=r});await original(options)};
 const pending=f.robot.connect();await wait(10);await f.robot.disconnect();release();
 assert.equal(await pending,false);await wait(20);assert.equal(f.port.closeCount,1);assert.equal(f.port.writes.length,0);
});

test('default startup accepts sensor frames after the former 6.5 second limit in one open',async()=>{
 const port=new FakePort({silent:true});const serial=new EventTarget();let picks=0;
 serial.requestPort=async()=>{picks++;return port};
 const robot=new RobotController(()=>serial);
 let boot;
 try {
  const pending=robot.connect();
  boot=setTimeout(()=>{
   assert.equal(port.writes.length,0);
   port.interval=setInterval(()=>port.controller.enqueue(Uint8Array.from([255,85,0,64,128,192,255])),8);
  },7000);
  assert.equal(await pending,true);assert.equal(picks,1);assert.equal(port.openCount,1);
  assert.ok(port.writes.length>0);
 } finally {clearTimeout(boot);await robot.disconnect()}
});

test('fast board connects without waiting for the full startup deadline',async()=>{
 const port=new FakePort();const serial=new EventTarget();serial.requestPort=async()=>port;
 const robot=new RobotController(()=>serial);const started=Date.now();
 try {assert.equal(await robot.connect(),true);assert.ok(Date.now()-started<5000)}
 finally {await robot.disconnect()}
});

test('sensor returns updated frames between repeated calls',async()=>{
 const {robot,port}=fixture();
 try {
  await robot.connect();clearInterval(port.interval);
  assert.equal(await robot.sensor(3),scaleSensor(192));
  port.controller.enqueue(Uint8Array.from([255,85,0,64,128,20,255]));
  await wait(10);
  assert.equal(await robot.sensor(3),scaleSensor(20));
 } finally {await robot.disconnect()}
});

test('disconnect during boot wait cancels connection without sending controls',async()=>{
 const {robot,port}=fixture({silent:true});const pending=robot.connect();
 await wait(40);await robot.disconnect();assert.equal(await pending,false);
 assert.equal(port.closeCount,1);assert.equal(port.writes.length,0);
 assert.equal(robot.getSnapshot().connection,'disconnected');
});

// Chrome replaces readable after a non-fatal hardware read error.
function overrun(port, fatal=false) {
 const old=port.controller;
 port.readable=fatal ? null : new ReadableStream({start:c=>{port.controller=c},cancel:()=>clearInterval(port.interval)});
 old.error(new DOMException('Buffer overrun','BufferOverrunError'));
}
test('first-open buffer overrun recovers on same port without another click',async()=>{
 const f=fixture();const original=f.port.open.bind(f.port);
 const messages=[];f.robot.subscribe(()=>messages.push(f.robot.getSnapshot().message));
 f.port.open=async options=>{await original(options);setTimeout(()=>overrun(f.port),0)};
 try {
  assert.equal(await f.robot.connect(),true);assert.equal(f.port.openCount,1);
  assert.equal(f.port.closeCount,0);assert.equal(await f.robot.sensor(3),scaleSensor(192));
  assert.ok(messages.some(m=>m.includes('USB 수신 복구 1/3')));
 } finally {await f.robot.disconnect()}
 assert.equal(f.port.closeCount,1);
});
test('overrun drops partial frame and reads only replacement-stream data',async()=>{
 const {robot,port}=fixture();
 try {
  await robot.connect();clearInterval(port.interval);
  port.controller.enqueue(Uint8Array.from([255,85,99]));await wait(5);
  overrun(port);await wait(5);assert.equal(robot.getSnapshot().sensors,null);
  await wait(40);assert.equal(robot.getSnapshot().connection,'connected');
  port.controller.enqueue(Uint8Array.from([1,2,3,255,85,10,20,30,40,50]));await wait(5);
  assert.deepEqual(robot.getSnapshot().raw,[10,20,30,40,50]);assert.equal(port.openCount,1);
 } finally {await robot.disconnect()}
});
test('fourth repeated overrun ends connection instead of retrying forever',async()=>{
 const {robot,port}=fixture();await robot.connect();
 for(let i=0;i<4;i++){overrun(port);await wait(10)}
 await robot.disconnect();assert.equal(robot.getSnapshot().connection,'disconnected');
 assert.match(robot.getSnapshot().error,/수신 복구 실패/);assert.equal(port.closeCount,1);
});
test('overrun with no replacement stream disconnects',async()=>{
 const {robot,port}=fixture();await robot.connect();clearInterval(port.interval);overrun(port,true);
 await wait(30);await robot.disconnect();assert.equal(robot.getSnapshot().connection,'disconnected');assert.equal(port.closeCount,1);
});

test('timed note writes A4 then turns off after duration',async()=>{
 const {robot,port}=fixture();await robot.connect();
 try {
  const started=Date.now();await robot.playNote(4,9,0.06);
  assert.ok(Date.now()-started>=50);assert.ok(port.writes.some(p=>p[10]===55));assert.equal(port.writes.at(-1)[10],0);
  await assert.rejects(robot.playNote(7,0,1));await assert.rejects(robot.playNote(4,12,1));await assert.rejects(robot.playNote(4,0,Infinity));
 } finally {await robot.disconnect()}
});
test('stop cancels a long note promptly and resume cannot resurrect it',async()=>{
 const {robot,port}=fixture();await robot.connect();
 try {
  const pending=robot.playNote(4,0,8);await wait(25);await robot.stop();
  await Promise.race([pending,wait(200).then(()=>{throw new Error('note did not cancel')})]);
  assert.equal(port.writes.at(-1)[10],0);await robot.start();await robot.tone(440);await wait(40);assert.equal(robot.getSnapshot().output.buzzer,55);
 } finally {await robot.disconnect()}
});
test('replacing a note preserves the newer tone and disconnect cancels waiting',async()=>{
 const {robot}=fixture();await robot.connect();
 try {
  const old=robot.playNote(4,0,8);await wait(15);await robot.tone(880);await old;assert.equal(robot.getSnapshot().output.buzzer,110);
  const pending=robot.playNote(6,11,8);await wait(20);assert.equal(robot.getSnapshot().output.buzzer,247);
  await robot.disconnect();await Promise.race([pending,wait(200).then(()=>{throw new Error('disconnect did not cancel note')})]);
 } finally {await robot.disconnect()}
});

test('sensor mapping handles range endpoints, fractional output, reverse ranges and invalid input',async()=>{
 const {robot,port}=fixture();await robot.connect();
 try {
  assert.equal(await robot.mapSensor(0,0,1023,0,180),0);
  assert.equal(await robot.mapSensor(4,0,1023,0,180),180);
  assert.ok(Math.abs(await robot.mapSensor(2,0,1023,0,180)-514*180/1023)<1e-10);
  assert.equal(await robot.mapSensor(0,0,1023,180,0),180);
  assert.equal(await robot.mapSensor(4,1023,0,0,180),0);
  assert.equal(await robot.mapSensor(0,200,800,0,255),0);
  assert.equal(await robot.mapSensor(4,200,800,0,255),255);
  assert.equal(await robot.mapSensor(2,0,1023,7,7),7);
  await assert.rejects(robot.mapSensor(0,10,10,0,180));
  await assert.rejects(robot.mapSensor(0,0,Infinity,0,180));
  await assert.rejects(robot.mapSensor(0,-Number.MAX_VALUE,Number.MAX_VALUE,0,180));
  await assert.rejects(robot.mapSensor(5,0,1023,0,180));
  clearInterval(port.interval);port.controller.enqueue(Uint8Array.from([255,85,0,64,255,192,255]));await wait(10);
  assert.equal(await robot.mapSensor(2,0,1023,0,180),180);
  await robot.stop();assert.equal(await robot.mapSensor(2,0,1023,0,180),180);
  await robot.disconnect();await assert.rejects(robot.mapSensor(2,0,1023,0,180));
 }finally{await robot.disconnect()}
});
