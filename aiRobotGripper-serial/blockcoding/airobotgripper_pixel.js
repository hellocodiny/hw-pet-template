// Proposed routing prefix aiRobotGripper must be confirmed by KT before registration.
javascriptGenerator.forBlock['airobotgripper_pixel'] = function (block, generator) {
  const pixel = Number(block.getFieldValue('PIXEL'))
  const r = generator.valueToCode(block, 'R', Order.NONE) || '255'
  const g = generator.valueToCode(block, 'G', Order.NONE) || '0'
  const b = generator.valueToCode(block, 'B', Order.NONE) || '0'
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripper.pixel', ${pixel}, (${r}), (${g}), (${b}));\n`
  return code
}
