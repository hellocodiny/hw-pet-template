// Proposed routing prefix aiRobotGripper requires KT registration.
javascriptGenerator.forBlock['airobotgripper_gripper'] = function (block, generator) {
  const angle = Number(block.getFieldValue('POSITION'))
  return `await makerKit.hw.run(routineContext, 'aiRobotGripper.servo', 3, ${angle});\n`
}
