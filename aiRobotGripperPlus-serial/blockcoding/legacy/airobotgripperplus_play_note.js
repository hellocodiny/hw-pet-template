// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
Blockly.JavaScript['airobotgripperplus_play_note'] = function(block) {
  const generator = Blockly.JavaScript;
  const Order = {NONE: Blockly.JavaScript.ORDER_NONE, AWAIT: Blockly.JavaScript.ORDER_AWAIT ?? Blockly.JavaScript.ORDER_NONE};
  const OCTAVE = Number(block.getFieldValue('OCTAVE'));
  const NOTE = Number(block.getFieldValue('NOTE'));
  const TIME = generator.valueToCode(block, 'TIME', Order.NONE) || "0.5";
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.playNoteBlock', ${OCTAVE}, ${NOTE}, (${TIME}))`;
  return code + ';\n';
};
