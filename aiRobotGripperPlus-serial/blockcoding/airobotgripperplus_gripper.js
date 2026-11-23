// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_gripper'] = function (block, generator) {
  const POSITION = Number(block.getFieldValue('POSITION'));
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.servo', 3, ${POSITION})`;
  return code + ';\n';
};
