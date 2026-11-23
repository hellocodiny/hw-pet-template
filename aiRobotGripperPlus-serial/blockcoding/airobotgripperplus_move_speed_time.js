// Registration draft: aiRobotGripperPlus routing prefix requires KT confirmation.
javascriptGenerator.forBlock['airobotgripperplus_move_speed_time'] = function (block, generator) {
  const DIRECTION = Number(block.getFieldValue('DIRECTION'));
  const SPEED = generator.valueToCode(block, 'SPEED', Order.NONE) || '200';
  const TIME = generator.valueToCode(block, 'TIME', Order.NONE) || '1';
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripperPlus.moveForBlock', ${DIRECTION}, (${TIME}), (${SPEED}))`;
  return code + ';\n';
};
