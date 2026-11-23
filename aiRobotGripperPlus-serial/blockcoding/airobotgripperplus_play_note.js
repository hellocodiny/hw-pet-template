// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_play_note'] = function (block, generator) {
  const OCTAVE = Number(block.getFieldValue('OCTAVE'));
  const NOTE = Number(block.getFieldValue('NOTE'));
  const TIME = generator.valueToCode(block, 'TIME', Order.NONE) || '0.5';
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.playNoteBlock', ${OCTAVE}, ${NOTE}, (${TIME}))`;
  return code + ';\n';
};
