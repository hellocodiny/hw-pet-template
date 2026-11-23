// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
Blockly.JavaScript['airobotgripperplus_monitor_sensor'] = function(block) {
  const generator = Blockly.JavaScript;
  const Order = {NONE: Blockly.JavaScript.ORDER_NONE, AWAIT: Blockly.JavaScript.ORDER_AWAIT ?? Blockly.JavaScript.ORDER_NONE};
  const SENSOR = JSON.stringify(block.getFieldValue('SENSOR'));
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.monitorSensor', ${SENSOR})`;
  return code + ';\n';
};
