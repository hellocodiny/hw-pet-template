// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
Blockly.JavaScript['airobotgripperplus_gripper'] = function (block) {
  const generator = Blockly.JavaScript;
  const Order = {
    NONE: Blockly.JavaScript.ORDER_NONE,
    AWAIT: Blockly.JavaScript.ORDER_AWAIT ?? Blockly.JavaScript.ORDER_NONE,
  };
  const POSITION = Number(block.getFieldValue('POSITION'));
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.servo', 3, ${POSITION})`;
  return code + ';\n';
};
