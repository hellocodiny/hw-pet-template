// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_pixel_index'] = function (block, generator) {
  const INDEX = generator.valueToCode(block, 'INDEX', Order.NONE) || '1';
  const RED = generator.valueToCode(block, 'RED', Order.NONE) || '0';
  const GREEN = generator.valueToCode(block, 'GREEN', Order.NONE) || '0';
  const BLUE = generator.valueToCode(block, 'BLUE', Order.NONE) || '100';
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.pixelIndex', (${INDEX}), (${RED}), (${GREEN}), (${BLUE}))`;
  return code + ';\n';
};
