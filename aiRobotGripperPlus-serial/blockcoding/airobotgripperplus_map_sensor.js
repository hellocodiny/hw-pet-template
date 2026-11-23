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
