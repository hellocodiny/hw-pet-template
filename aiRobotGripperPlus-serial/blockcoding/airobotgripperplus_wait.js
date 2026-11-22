// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_wait'] = function(block, generator) {
  const TIME = generator.valueToCode(block, 'TIME', Order.NONE) || "1";
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.waitSeconds', (${TIME}))`;
  return code + ';\n';
};
