// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_servo'] = function(block, generator) {
  const CHANNEL = Number(block.getFieldValue('CHANNEL'));
  const ANGLE = generator.valueToCode(block, 'ANGLE', Order.NONE) || "90";
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.servo', ${CHANNEL}, (${ANGLE}))`;
  return code + ';\n';
};
