// Proposed routing prefix aiRobotGripper requires KT registration.
javascriptGenerator.forBlock['airobotgripper_pixel_colour'] = function (block, generator) {
  const which = Number(block.getFieldValue('PIXEL'));
  const colour = String(block.getFieldValue('COLOUR'));
  if (!/^#[0-9a-f]{6}$/i.test(colour)) throw new Error('올바른 색상을 선택하세요.');
  const rgb = [1, 3, 5].map((i) => parseInt(colour.slice(i, i + 2), 16));
  return `await makerKit.hw.run(routineContext, 'aiRobotGripper.pixel', ${which}, ${rgb[0]}, ${rgb[1]}, ${rgb[2]});\n`;
};
