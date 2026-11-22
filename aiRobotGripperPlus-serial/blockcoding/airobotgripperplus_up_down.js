// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_up_down'] = function(block, generator) {
  const POSITION = Number(block.getFieldValue('POSITION'));
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.servo', 1, ${POSITION})`;
  return code + ';\n';
};
