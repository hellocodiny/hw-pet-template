// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_motor_stop'] = function(block, generator) {

  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.motor', 0)`;
  return code + ';\n';
};
