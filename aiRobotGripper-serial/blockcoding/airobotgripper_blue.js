// Proposed routing prefix aiRobotGripper must be confirmed by KT before registration.
javascriptGenerator.forBlock['airobotgripper_blue'] = function (block, generator) {
  const value = generator.valueToCode(block, 'VALUE', Order.NONE) || '128'
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripper.blue', (${value}));\n`
  return code
}
