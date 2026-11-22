const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const base=path.join(__dirname,'../blockcoding');
const definitions=JSON.parse(fs.readFileSync(path.join(base,'definitions.json')));
const specs=JSON.parse(fs.readFileSync(path.join(base,'manifest.json')));
const flyout=JSON.parse(fs.readFileSync(path.join(base,'flyout.json')));
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const Order={NONE:99,AWAIT:4.8};
function setup(){const javascriptGenerator={forBlock:{}};vm.runInNewContext(fs.readFileSync(path.join(base,'generators.js'),'utf8'),{javascriptGenerator,Order});return javascriptGenerator}
test('every definition, individual generator and flyout entry uses the same fields and block type',()=>{
 assert.equal(new Set(definitions.map(d=>d.type)).size,13);
 const gen=setup();
 for(const d of definitions){
  assert.equal(typeof gen.forBlock[d.type],'function');
  const item=flyout.contents.find(i=>i.type===d.type);assert.ok(item);
  for(const [name,input] of Object.entries(item.inputs||{})){
   assert.ok(d.args0.some(a=>a.name===name&&a.type==='input_value'));
   assert.equal(typeof input.shadow.fields.NUM,'number');
  }
  const individual={forBlock:{}};vm.runInNewContext(fs.readFileSync(path.join(base,d.type+'.js'),'utf8'),{javascriptGenerator:individual,Order});
  assert.equal(typeof individual.forBlock[d.type],'function');
 }
});
for(const spec of specs.filter(s=>!s.testKind))test(spec.type+' emits executable calls with the right argument order',async()=>{
 const gen=setup();let received;const ctx={};
 const fields=Object.fromEntries(spec.fields.filter(f=>f.type==='field_dropdown').map(f=>[f.name,f.options[0][1]]));
 const block={getFieldValue:name=>fields[name]};
 const generator={valueToCode:(_b,name)=>spec.defaults[name]===undefined?'':`(${spec.defaults[name]} + 1)`};
 const output=gen.forBlock[spec.type](block,generator);
 const source=spec.reporter?'return ('+output[0]+') + 2;':output;
 const value=await new AsyncFunction('makerKit','routineContext',source)({hw:{run:async(...args)=>{received=args;return 700}}},ctx);
 const expected=spec.fields.map(f=>f.type==='field_dropdown'?Number(fields[f.name]):spec.defaults[f.name]+1);
 assert.deepEqual(received,[ctx,'aiRobotGripper.'+spec.method,...expected]);
 if(spec.reporter){assert.equal(value,702);assert.equal(output[1],Order.AWAIT)}
 // Empty numeric sockets must still produce valid commands using defaults.
 const empty=gen.forBlock[spec.type](block,{valueToCode:()=>''});
 await new AsyncFunction('makerKit','routineContext',spec.reporter?'return '+empty[0]:empty)({hw:{run:async()=>0}},ctx);
});

test('direction blocks preserve PC app mappings for all nine choices',async()=>{
 const gen=setup();
 for(const [key,ch,angles] of [['up_down',1,[0,90,180]],['left_right',2,[180,90,0]],['gripper',3,[0,90,180]]]){
  for(const angle of angles){let call;const code=gen.forBlock['airobotgripper_'+key]({getFieldValue:()=>String(angle)},{});
   await new AsyncFunction('makerKit','routineContext',code)({hw:{run:async(...args)=>call=args}},null);
   assert.deepEqual(call,[null,'aiRobotGripper.servo',ch,angle]);
  }
 }
});
test('colour picker converts RGB and rejects invalid field contents',async()=>{
 const gen=setup();
 for(const [colour,rgb] of [['#ff0000',[255,0,0]],['#12aBef',[18,171,239]],['#000000',[0,0,0]]]){
  let call;const code=gen.forBlock.airobotgripper_pixel_colour({getFieldValue:n=>n==='PIXEL'?'2':colour},{});
  await new AsyncFunction('makerKit','routineContext',code)({hw:{run:async(...args)=>call=args}},null);
  assert.deepEqual(call,[null,'aiRobotGripper.pixel',2,...rgb]);
 }
 assert.throws(()=>gen.forBlock.airobotgripper_pixel_colour({getFieldValue:()=>"invalid"},{}));
});
test('note block awaits the duration command with octave, semitone, seconds',async()=>{
 const gen=setup();let call;const values={OCTAVE:'4',NOTE:'9',SECONDS:'0.5'};
 const code=gen.forBlock.airobotgripper_play_note({getFieldValue:n=>values[n]},{});
 await new AsyncFunction('makerKit','routineContext',code)({hw:{run:async(...args)=>call=args}},null);
 assert.deepEqual(call,[null,'aiRobotGripper.playNote',4,9,0.5]);
});

 test('NeoPixel all-off only sends pixel(2,0,0,0), removed controls absent',async()=>{
 const gen=setup();assert.equal(gen.forBlock.airobotgripper_start,undefined);assert.equal(gen.forBlock.airobotgripper_stop,undefined);
 const calls=[];await new AsyncFunction('makerKit','routineContext',gen.forBlock.airobotgripper_pixel_off({},{}))({hw:{run:async(...args)=>calls.push(args)}},null);
 assert.deepEqual(calls,[[null,'aiRobotGripper.pixel',2,0,0,0]]);
 });
