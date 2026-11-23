// Proposed routing prefix aiRobotGripper must be confirmed by KT before registration.
javascriptGenerator.forBlock['airobotgripper_servos'] = function (block, generator) {
  const ud = generator.valueToCode(block, 'UD', Order.NONE) || '90';
  const lr = generator.valueToCode(block, 'LR', Order.NONE) || '90';
  const gr = generator.valueToCode(block, 'GR', Order.NONE) || '90';
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripper.servos', (${ud}), (${lr}), (${gr}));\n`;
  return code;
};
