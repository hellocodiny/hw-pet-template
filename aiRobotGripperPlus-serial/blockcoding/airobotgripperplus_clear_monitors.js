// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_clear_monitors'] = function(block, generator) {

  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.clearMonitors')`;
  return code + ';\n';
};
