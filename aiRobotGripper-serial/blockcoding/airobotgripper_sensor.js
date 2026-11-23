// Proposed routing prefix aiRobotGripper must be confirmed by KT before registration.
javascriptGenerator.forBlock['airobotgripper_sensor'] = function (block, generator) {
  const sensor = Number(block.getFieldValue('SENSOR'))
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripper.sensor', ${sensor})`
  return [code, Order.AWAIT]
}
