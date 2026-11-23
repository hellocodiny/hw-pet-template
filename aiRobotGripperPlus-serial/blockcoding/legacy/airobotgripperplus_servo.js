// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
Blockly.JavaScript['airobotgripperplus_servo'] = function (block) {
  const generator = Blockly.JavaScript;
  const Order = {
    NONE: Blockly.JavaScript.ORDER_NONE,
    AWAIT: Blockly.JavaScript.ORDER_AWAIT ?? Blockly.JavaScript.ORDER_NONE,
  };
  const CHANNEL = Number(block.getFieldValue('CHANNEL'));
  const ANGLE = generator.valueToCode(block, 'ANGLE', Order.NONE) || '90';
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.servo', ${CHANNEL}, (${ANGLE}))`;
  return code + ';\n';
};
