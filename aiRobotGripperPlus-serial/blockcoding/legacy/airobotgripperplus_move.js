// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
Blockly.JavaScript['airobotgripperplus_move'] = function (block) {
  const generator = Blockly.JavaScript;
  const Order = {
    NONE: Blockly.JavaScript.ORDER_NONE,
    AWAIT: Blockly.JavaScript.ORDER_AWAIT ?? Blockly.JavaScript.ORDER_NONE,
  };
  const DIRECTION = Number(block.getFieldValue('DIRECTION'));
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.motor', ${DIRECTION})`;
  return code + ';\n';
};
