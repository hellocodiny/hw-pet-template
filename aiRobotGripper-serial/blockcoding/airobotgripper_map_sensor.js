// Proposed routing prefix aiRobotGripper requires KT registration.
javascriptGenerator.forBlock['airobotgripper_map_sensor'] = function (block, generator) {
  const sensor = Number(block.getFieldValue('SENSOR'))
  const inMin = generator.valueToCode(block, 'IN_MIN', Order.NONE) || '0'
  const inMax = generator.valueToCode(block, 'IN_MAX', Order.NONE) || '1023'
  const outMin = generator.valueToCode(block, 'OUT_MIN', Order.NONE) || '0'
  const outMax = generator.valueToCode(block, 'OUT_MAX', Order.NONE) || '180'
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripper.mapSensor', ${sensor}, (${inMin}), (${inMax}), (${outMin}), (${outMax}))`
  return [code, Order.AWAIT]
}
