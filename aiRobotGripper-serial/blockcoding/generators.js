// Proposed routing prefix aiRobotGripper must be confirmed by KT before registration.
javascriptGenerator.forBlock['airobotgripper_servo'] = function (block, generator) {
  const channel = Number(block.getFieldValue('CHANNEL'))
  const angle = generator.valueToCode(block, 'ANGLE', Order.NONE) || '90'
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripper.servo', ${channel}, (${angle}));\n`
  return code
}

// Proposed routing prefix aiRobotGripper must be confirmed by KT before registration.
javascriptGenerator.forBlock['airobotgripper_servos'] = function (block, generator) {
  const ud = generator.valueToCode(block, 'UD', Order.NONE) || '90'
  const lr = generator.valueToCode(block, 'LR', Order.NONE) || '90'
  const gr = generator.valueToCode(block, 'GR', Order.NONE) || '90'
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripper.servos', (${ud}), (${lr}), (${gr}));\n`
  return code
}

// Proposed routing prefix aiRobotGripper must be confirmed by KT before registration.
javascriptGenerator.forBlock['airobotgripper_pixel'] = function (block, generator) {
  const pixel = Number(block.getFieldValue('PIXEL'))
  const r = generator.valueToCode(block, 'R', Order.NONE) || '255'
  const g = generator.valueToCode(block, 'G', Order.NONE) || '0'
  const b = generator.valueToCode(block, 'B', Order.NONE) || '0'
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripper.pixel', ${pixel}, (${r}), (${g}), (${b}));\n`
  return code
}

// Proposed routing prefix aiRobotGripper must be confirmed by KT before registration.
javascriptGenerator.forBlock['airobotgripper_blue'] = function (block, generator) {
  const value = generator.valueToCode(block, 'VALUE', Order.NONE) || '128'
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripper.blue', (${value}));\n`
  return code
}

// Proposed routing prefix aiRobotGripper must be confirmed by KT before registration.
javascriptGenerator.forBlock['airobotgripper_tone'] = function (block, generator) {
  const hz = generator.valueToCode(block, 'HZ', Order.NONE) || '440'
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripper.tone', (${hz}));\n`
  return code
}

// Proposed routing prefix aiRobotGripper must be confirmed by KT before registration.
javascriptGenerator.forBlock['airobotgripper_sensor'] = function (block, generator) {
  const sensor = Number(block.getFieldValue('SENSOR'))
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripper.sensor', ${sensor})`
  return [code, Order.AWAIT]
}

// Proposed routing prefix aiRobotGripper requires KT registration.
javascriptGenerator.forBlock['airobotgripper_up_down'] = function (block, generator) {
  const angle = Number(block.getFieldValue('POSITION'))
  return `await makerKit.hw.run(routineContext, 'aiRobotGripper.servo', 1, ${angle});\n`
}

// Proposed routing prefix aiRobotGripper requires KT registration.
javascriptGenerator.forBlock['airobotgripper_left_right'] = function (block, generator) {
  const angle = Number(block.getFieldValue('POSITION'))
  return `await makerKit.hw.run(routineContext, 'aiRobotGripper.servo', 2, ${angle});\n`
}

// Proposed routing prefix aiRobotGripper requires KT registration.
javascriptGenerator.forBlock['airobotgripper_gripper'] = function (block, generator) {
  const angle = Number(block.getFieldValue('POSITION'))
  return `await makerKit.hw.run(routineContext, 'aiRobotGripper.servo', 3, ${angle});\n`
}

// Proposed routing prefix aiRobotGripper requires KT registration.
javascriptGenerator.forBlock['airobotgripper_pixel_colour'] = function (block, generator) {
  const which = Number(block.getFieldValue('PIXEL'))
  const colour = String(block.getFieldValue('COLOUR'))
  if (!/^#[0-9a-f]{6}$/i.test(colour)) throw new Error('올바른 색상을 선택하세요.')
  const rgb = [1, 3, 5].map(i => parseInt(colour.slice(i, i + 2), 16))
  return `await makerKit.hw.run(routineContext, 'aiRobotGripper.pixel', ${which}, ${rgb[0]}, ${rgb[1]}, ${rgb[2]});\n`
}

// Proposed routing prefix aiRobotGripper requires KT registration.
javascriptGenerator.forBlock['airobotgripper_play_note'] = function (block, generator) {
  const octave = Number(block.getFieldValue('OCTAVE'))
  const note = Number(block.getFieldValue('NOTE'))
  const seconds = Number(block.getFieldValue('SECONDS'))
  return `await makerKit.hw.run(routineContext, 'aiRobotGripper.playNote', ${octave}, ${note}, ${seconds});\n`
}

// Proposed routing prefix aiRobotGripper requires KT registration.
javascriptGenerator.forBlock['airobotgripper_map_sensor'] = function (block, generator) {
  const sensor = Number(block.getFieldValue('SENSOR'))
  const inMin = generator.valueToCode(block, 'IN_MIN', Order.NONE) || '0'
  const inMax = generator.valueToCode(block, 'IN_MAX', Order.NONE) || '1023'
  const outMin = generator.valueToCode(block, 'OUT_MIN', Order.NONE) || '0'
  const outMax = generator.valueToCode(block, 'OUT_MAX', Order.NONE) || '180'
  const code = `await makerKit.hw.run(routineContext, 'aiRobotGripper.mapSensor', ${sensor}, (${inMin}), (${inMax}), (${outMin}), (${outMax}))`
  return [code, Order.AWAIT]
}

// Proposed routing prefix aiRobotGripper requires KT registration.
javascriptGenerator.forBlock['airobotgripper_pixel_off'] = function (block, generator) {
  return `await makerKit.hw.run(routineContext, 'aiRobotGripper.pixel', 2, 0, 0, 0);\n`
}
