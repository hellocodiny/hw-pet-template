// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
Blockly.JavaScript['airobotgripperplus_pixel_rgb'] = function (block) {
  const generator = Blockly.JavaScript;
  const Order = {
    NONE: Blockly.JavaScript.ORDER_NONE,
    AWAIT: Blockly.JavaScript.ORDER_AWAIT ?? Blockly.JavaScript.ORDER_NONE,
  };
  const TARGET = Number(block.getFieldValue('TARGET'));
  const RED = generator.valueToCode(block, 'RED', Order.NONE) || '0';
  const GREEN = generator.valueToCode(block, 'GREEN', Order.NONE) || '0';
  const BLUE = generator.valueToCode(block, 'BLUE', Order.NONE) || '100';
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.pixel', ${TARGET}, (${RED}), (${GREEN}), (${BLUE}))`;
  return code + ';\n';
};
