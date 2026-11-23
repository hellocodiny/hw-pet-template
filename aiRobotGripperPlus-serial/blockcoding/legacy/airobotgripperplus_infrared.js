// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
Blockly.JavaScript['airobotgripperplus_infrared'] = function(block) {
  const generator = Blockly.JavaScript;
  const Order = {NONE: Blockly.JavaScript.ORDER_NONE, AWAIT: Blockly.JavaScript.ORDER_AWAIT ?? Blockly.JavaScript.ORDER_NONE};
  const SENSOR = JSON.stringify(block.getFieldValue('SENSOR'));
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.sensor', ${SENSOR})`;
  return [code, Order.AWAIT];
};
