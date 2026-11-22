// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_infrared'] = function(block, generator) {
  const SENSOR = JSON.stringify(block.getFieldValue('SENSOR'));
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.sensor', ${SENSOR})`;
  return [code, Order.AWAIT];
};
