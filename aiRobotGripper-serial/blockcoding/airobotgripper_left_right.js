// Proposed routing prefix aiRobotGripper requires KT registration.
javascriptGenerator.forBlock['airobotgripper_left_right'] = function (block, generator) {
  const angle = Number(block.getFieldValue('POSITION'))
  return `await makerKit.hw.run(routineContext, 'aiRobotGripper.servo', 2, ${angle});\n`
}
