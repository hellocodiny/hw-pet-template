// Proposed routing prefix aiRobotGripper must be confirmed by KT before registration.
javascriptGenerator.forBlock['airobotgripper_tone'] = function (block, generator) {
  const hz = generator.valueToCode(block, 'HZ', Order.NONE) || '440'
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripper.tone', (${hz}));\n`
  return code
}
