// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_pixel_off'] = function(block, generator) {

  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.pixel', 2, 0, 0, 0)`;
  return code + ';\n';
};
