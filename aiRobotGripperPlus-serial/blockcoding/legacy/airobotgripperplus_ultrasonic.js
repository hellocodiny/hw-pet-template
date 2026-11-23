// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
Blockly.JavaScript['airobotgripperplus_ultrasonic'] = function (block) {
  const generator = Blockly.JavaScript;
  const Order = {
    NONE: Blockly.JavaScript.ORDER_NONE,
    AWAIT: Blockly.JavaScript.ORDER_AWAIT ?? Blockly.JavaScript.ORDER_NONE,
  };

  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.sensor', 'distance')`;
  return [code, Order.AWAIT];
};
