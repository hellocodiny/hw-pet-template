// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_monitor_sensor'] = function(block, generator) {
  const SENSOR = JSON.stringify(block.getFieldValue('SENSOR'));
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.monitorSensor', ${SENSOR})`;
  return code + ';\n';
};
