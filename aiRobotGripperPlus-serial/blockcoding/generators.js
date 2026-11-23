// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_move'] = function(block, generator) {
  const DIRECTION = Number(block.getFieldValue('DIRECTION'));
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.motor', ${DIRECTION})`;
  return code + ';\n';
};

// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_move_time'] = function(block, generator) {
  const DIRECTION = Number(block.getFieldValue('DIRECTION'));
  const TIME = generator.valueToCode(block, 'TIME', Order.NONE) || "1";
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.moveForBlock', ${DIRECTION}, (${TIME}))`;
  return code + ';\n';
};

// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_move_speed_time'] = function(block, generator) {
  const DIRECTION = Number(block.getFieldValue('DIRECTION'));
  const SPEED = generator.valueToCode(block, 'SPEED', Order.NONE) || "200";
  const TIME = generator.valueToCode(block, 'TIME', Order.NONE) || "1";
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.moveForBlock', ${DIRECTION}, (${TIME}), (${SPEED}))`;
  return code + ';\n';
};

// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_motor_stop'] = function(block, generator) {

  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.motor', 0)`;
  return code + ';\n';
};

// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_wait'] = function(block, generator) {
  const TIME = generator.valueToCode(block, 'TIME', Order.NONE) || "1";
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.waitSeconds', (${TIME}))`;
  return code + ';\n';
};

// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_up_down'] = function(block, generator) {
  const POSITION = Number(block.getFieldValue('POSITION'));
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.servo', 1, ${POSITION})`;
  return code + ';\n';
};

// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_left_right'] = function(block, generator) {
  const POSITION = Number(block.getFieldValue('POSITION'));
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.servo', 2, ${POSITION})`;
  return code + ';\n';
};

// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_gripper'] = function(block, generator) {
  const POSITION = Number(block.getFieldValue('POSITION'));
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.servo', 3, ${POSITION})`;
  return code + ';\n';
};

// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_servo'] = function(block, generator) {
  const CHANNEL = Number(block.getFieldValue('CHANNEL'));
  const ANGLE = generator.valueToCode(block, 'ANGLE', Order.NONE) || "90";
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.servo', ${CHANNEL}, (${ANGLE}))`;
  return code + ';\n';
};

// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_play_note'] = function(block, generator) {
  const OCTAVE = Number(block.getFieldValue('OCTAVE'));
  const NOTE = Number(block.getFieldValue('NOTE'));
  const TIME = generator.valueToCode(block, 'TIME', Order.NONE) || "0.5";
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.playNoteBlock', ${OCTAVE}, ${NOTE}, (${TIME}))`;
  return code + ';\n';
};

// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_pixel_colour'] = function(block, generator) {
  const TARGET = Number(block.getFieldValue('TARGET'));
  const COLOUR = block.getFieldValue('COLOUR');
  if (!/^#[0-9a-f]{6}$/i.test(COLOUR)) throw new Error('올바른 색상을 선택하세요.');
  const rgb = [1,3,5].map(i => parseInt(COLOUR.slice(i,i+2),16));
  const maximum = Math.max(...rgb);
  const [r,g,b] = rgb.map(v => maximum ? Math.round(v / maximum * 100) : 0);
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.pixel', ${TARGET}, ${r}, ${g}, ${b})`;
  return code + ';\n';
};

// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_pixel_rgb'] = function(block, generator) {
  const TARGET = Number(block.getFieldValue('TARGET'));
  const RED = generator.valueToCode(block, 'RED', Order.NONE) || "0";
  const GREEN = generator.valueToCode(block, 'GREEN', Order.NONE) || "0";
  const BLUE = generator.valueToCode(block, 'BLUE', Order.NONE) || "100";
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.pixel', ${TARGET}, (${RED}), (${GREEN}), (${BLUE}))`;
  return code + ';\n';
};

// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_pixel_index'] = function(block, generator) {
  const INDEX = generator.valueToCode(block, 'INDEX', Order.NONE) || "1";
  const RED = generator.valueToCode(block, 'RED', Order.NONE) || "0";
  const GREEN = generator.valueToCode(block, 'GREEN', Order.NONE) || "0";
  const BLUE = generator.valueToCode(block, 'BLUE', Order.NONE) || "100";
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.pixelIndex', (${INDEX}), (${RED}), (${GREEN}), (${BLUE}))`;
  return code + ';\n';
};

// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_pixel_off'] = function(block, generator) {

  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.pixel', 2, 0, 0, 0)`;
  return code + ';\n';
};

// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_monitor_sensor'] = function(block, generator) {
  const SENSOR = JSON.stringify(block.getFieldValue('SENSOR'));
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.monitorSensor', ${SENSOR})`;
  return code + ';\n';
};

// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_clear_monitors'] = function(block, generator) {

  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.clearMonitors')`;
  return code + ';\n';
};

// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_map_sensor'] = function(block, generator) {
  const SENSOR = JSON.stringify(block.getFieldValue('SENSOR'));
  const IN_MIN = generator.valueToCode(block, 'IN_MIN', Order.NONE) || "5";
  const IN_MAX = generator.valueToCode(block, 'IN_MAX', Order.NONE) || "50";
  const OUT_MIN = generator.valueToCode(block, 'OUT_MIN', Order.NONE) || "0";
  const OUT_MAX = generator.valueToCode(block, 'OUT_MAX', Order.NONE) || "180";
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.mapSensor', ${SENSOR}, (${IN_MIN}), (${IN_MAX}), (${OUT_MIN}), (${OUT_MAX}))`;
  return [code, Order.AWAIT];
};

// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_infrared'] = function(block, generator) {
  const SENSOR = JSON.stringify(block.getFieldValue('SENSOR'));
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.sensor', ${SENSOR})`;
  return [code, Order.AWAIT];
};

// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_ultrasonic'] = function(block, generator) {

  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.sensor', 'distance')`;
  return [code, Order.AWAIT];
};
