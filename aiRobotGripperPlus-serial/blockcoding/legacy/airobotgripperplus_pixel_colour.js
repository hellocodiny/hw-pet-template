// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
Blockly.JavaScript['airobotgripperplus_pixel_colour'] = function (block) {
  const generator = Blockly.JavaScript;
  const Order = {
    NONE: Blockly.JavaScript.ORDER_NONE,
    AWAIT: Blockly.JavaScript.ORDER_AWAIT ?? Blockly.JavaScript.ORDER_NONE,
  };
  const TARGET = Number(block.getFieldValue('TARGET'));
  const COLOUR = block.getFieldValue('COLOUR');
  if (!/^#[0-9a-f]{6}$/i.test(COLOUR)) throw new Error('올바른 색상을 선택하세요.');
  const rgb = [1, 3, 5].map((i) => parseInt(COLOUR.slice(i, i + 2), 16));
  const maximum = Math.max(...rgb);
  const [r, g, b] = rgb.map((v) => (maximum ? Math.round((v / maximum) * 100) : 0));
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.pixel', ${TARGET}, ${r}, ${g}, ${b})`;
  return code + ';\n';
};
