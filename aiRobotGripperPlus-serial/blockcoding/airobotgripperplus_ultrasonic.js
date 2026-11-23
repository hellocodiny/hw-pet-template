// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_ultrasonic'] = function(block, generator) {

  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.sensor', 'distance')`;
  return [code, Order.AWAIT];
};
