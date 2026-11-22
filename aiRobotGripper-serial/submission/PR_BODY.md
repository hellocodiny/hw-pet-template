Adds aiRobotGripper-serial using existing Nano firmware and 115200-baud Web Serial. Includes recovery for non-fatal serial buffer overruns, three servo channels, two NeoPixels, blue LED, buzzer, five sensors, timed notes and sensor mapping.

Includes 13 registration block drafts. Removes user-facing start/stop blocks and adds NeoPixel all-off via pixel(2,0,0,0). Internal lifecycle methods remain. No standalone Blockly test host or firmware changes.

KT confirmation required: iframe ID aiRobotGripper-serial, routing prefix aiRobotGripper, deployment path and start/stop lifecycle integration. Live service registration and global stop/restart are not yet validated.

User hardware checks passed for USB connection, controls and changing sensors. See VALIDATION.md for automated checks.
