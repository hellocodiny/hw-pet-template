// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_move'] = function (block, generator) {
  const DIRECTION = Number(block.getFieldValue('DIRECTION'));
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.motor', ${DIRECTION})`;
  return code + ';\n';
};
