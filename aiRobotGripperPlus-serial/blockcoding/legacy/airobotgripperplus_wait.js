// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
Blockly.JavaScript['airobotgripperplus_wait'] = function(block) {
  const generator = Blockly.JavaScript;
  const Order = {NONE: Blockly.JavaScript.ORDER_NONE, AWAIT: Blockly.JavaScript.ORDER_AWAIT ?? Blockly.JavaScript.ORDER_NONE};
  const TIME = generator.valueToCode(block, 'TIME', Order.NONE) || "1";
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.waitSeconds', (${TIME}))`;
  return code + ';\n';
};
