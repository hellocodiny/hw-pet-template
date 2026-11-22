// Proposed routing prefix aiRobotGripper requires KT registration.
javascriptGenerator.forBlock['airobotgripper_play_note'] = function (block, generator) {
  const octave = Number(block.getFieldValue('OCTAVE'))
  const note = Number(block.getFieldValue('NOTE'))
  const seconds = Number(block.getFieldValue('SECONDS'))
  return `await makerKit.hw.run(routineContext, 'aiRobotGripper.playNote', ${octave}, ${note}, ${seconds});\n`
}
