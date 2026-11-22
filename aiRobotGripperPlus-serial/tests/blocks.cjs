const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../blockcoding'),read=n=>JSON.parse(fs.readFileSync(path.join(root,n)));
const definitions=read('definitions.json'),specs=read('manifest.json'),fly=read('flyout.json');
const {RobotController}=require('../.test-build/RobotController');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const Order={NONE:99,AWAIT:4.8};
function generators(file='generators.js'){const javascriptGenerator={forBlock:{}};vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),{javascriptGenerator,Order});return javascriptGenerator}
const gen=generators();
function generate(key,fields={},values={}){const type='airobotgripperplus_'+key,d=definitions.find(x=>x.type===type),spec=specs.find(x=>x.type===type);const base={};for(const a of d.args0){if(a.type==='field_dropdown')base[a.name]=a.options[0][1];if(a.type==='field_colour')base[a.name]=a.colour}return gen.forBlock[type]({getFieldValue:n=>fields[n]??base[n]},{valueToCode:(_,n)=>values[n]??String(spec.defaults[n]??'')})}
async function execute(result){const calls=[];const makerKit={hw:{run:async(ctx,route,...args)=>{calls.push({route,args});return 42}}};await new AsyncFunction('makerKit','routineContext',Array.isArray(result)?`return (${result[0]});`:result)(makerKit,{});return calls}
test('19 definitions, individual files, combined generators, flyout and runtime API agree',()=>{
 assert.equal(definitions.length,19);assert.equal(new Set(definitions.map(x=>x.type)).size,19);const controller=new RobotController();
 for(const d of definitions){assert.deepEqual(read(d.type+'.json'),d);assert.ok(fly.contents.find(x=>x.type===d.type));const spec=specs.find(x=>x.type===d.type);assert.equal(typeof controller[spec.method],'function');assert.equal(typeof generators(d.type+'.js').forBlock[d.type],'function');assert.equal(typeof gen.forBlock[d.type],'function');assert.equal((d.message0.match(/%\d+/g)||[]).length,d.args0.length);for(const [n,v] of Object.entries(spec.defaults)){assert.ok(d.args0.some(a=>a.name===n&&a.type==='input_value'));assert.equal(fly.contents.find(x=>x.type===d.type).inputs[n].shadow.fields.NUM,v)}}
 assert.ok(!definitions.some(d=>/resume|output_stop/.test(d.type)));
});
const cases=[
 ['move','motor',[1]],['move_time','moveForBlock',[1,1]],['move_speed_time','moveForBlock',[1,1,200]],['motor_stop','motor',[0]],['wait','waitSeconds',[1]],
 ['up_down','servo',[1,0]],['left_right','servo',[2,180]],['gripper','servo',[3,0]],['servo','servo',[1,90]],['play_note','playNoteBlock',[4,0,.5]],
 ['pixel_colour','pixel',[2,20,40,100]],['pixel_rgb','pixel',[2,0,0,100]],['pixel_index','pixelIndex',[1,0,0,100]],['pixel_off','pixel',[2,0,0,0]],
 ['monitor_sensor','monitorSensor',['distance']],['clear_monitors','clearMonitors',[]],['map_sensor','mapSensor',['distance',5,50,0,180]],['infrared','sensor',['left']],['ultrasonic','sensor',['distance']]
];
for(const [key,method,args] of cases)test(`${key} generates executable routing and arguments`,async()=>{assert.deepEqual(await execute(generate(key)),[{route:'aiRobotGripperPlus.'+method,args}])});
test('all nine direction choices preserve PC joint mappings',async()=>{
 for(const [key,ch,values] of [['up_down',1,[0,90,180]],['left_right',2,[180,90,0]],['gripper',3,[0,90,180]]])for(const v of values)assert.deepEqual((await execute(generate(key,{POSITION:String(v)})))[0].args,[ch,v]);
});
test('nested async sensor reporter can feed angle input',async()=>{const calls=await execute(generate('servo',{}, {ANGLE:generate('map_sensor')[0]}));assert.equal(calls[0].route,'aiRobotGripperPlus.mapSensor');assert.deepEqual(calls[1],{route:'aiRobotGripperPlus.servo',args:[1,42]})});
test('colour picker matches PC scaling including black and invalid field input',async()=>{assert.deepEqual((await execute(generate('pixel_colour',{COLOUR:'#000000'})))[0].args,[2,0,0,0]);assert.throws(()=>generate('pixel_colour',{COLOUR:'bad'}));assert.deepEqual((await execute(generate('pixel_colour',{COLOUR:'#FF8000'})))[0].args,[2,100,50,0])});

test('legacy editor adapters generate the same calls as modern generators',()=>{
 for(const d of definitions){
 const Blockly={JavaScript:{ORDER_NONE:99,ORDER_AWAIT:4.8,valueToCode:()=>''}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'legacy',d.type+'.js'),'utf8'),{Blockly});
 const fields=Object.fromEntries(d.args0.filter(a=>a.type!=='input_value').map(a=>[a.name,a.options?a.options[0][1]:a.colour]));
 const result=Blockly.JavaScript[d.type]({getFieldValue:n=>fields[n]});
 assert.equal(JSON.stringify(result),JSON.stringify(generate(d.type.replace('airobotgripperplus_',''))));
 }
});
