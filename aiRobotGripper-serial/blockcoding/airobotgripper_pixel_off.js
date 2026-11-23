// Proposed routing prefix aiRobotGripper requires KT registration.
javascriptGenerator.forBlock['airobotgripper_pixel_off'] = function (block, generator) {
  return `await makerKit.hw.run(routineContext, 'aiRobotGripper.pixel', 2, 0, 0, 0);\n`;
};
