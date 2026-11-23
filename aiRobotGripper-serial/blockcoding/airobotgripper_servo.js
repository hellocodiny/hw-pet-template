// Proposed routing prefix aiRobotGripper must be confirmed by KT before registration.
javascriptGenerator.forBlock['airobotgripper_servo'] = function (block, generator) {
  const channel = Number(block.getFieldValue('CHANNEL'));
  const angle = generator.valueToCode(block, 'ANGLE', Order.NONE) || '90';
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripper.servo', ${channel}, (${angle}));\n`;
  return code;
};
