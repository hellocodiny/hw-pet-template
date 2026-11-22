## Summary
Adds `aiRobotGripperPlus-serial` for AI Robot Gripper Plus using an existing USB BLE dongle over Web Serial (115200 baud). Arduino, dongle and BLE module firmware remain unchanged.

Supports robot discovery/selection, relay-based multi-target control, wheel movement, three servo joints, four NeoPixels, timed buzzer notes and relay-robot sensor readings. Includes 19 draft block definitions/generators, sensor mapping and an iframe sensor monitor.

## Validation
- 43 automated checks: 19 transport/controller/API checks and 24 block checks.
- Production build: compilation, type checking, lint and static generation passed.
- User-reported hardware checks passed for discovery/connection, code=2 initialization acknowledgement, changing sensors, controls and multi-target operation.
- One personal ultrasonic block was saved and displayed in Block Playground; end-to-end block execution is not yet validated because this product is not available in its IFRAME hardware selection list.

## Integration review requested
- Confirm proposed iframe ID `aiRobotGripperPlus-serial`, production deployment path and routing prefix `aiRobotGripperPlus`.
- Confirm `makerKit.hw.run` routing and program-wide stop/restart lifecycle integration.
- Confirm whether maintainers import the block drafts or the author should register them in the block workshop after hardware setup.

## Limitations
The dongle connects directly to one relay robot. Additional targets receive relayed commands; their execution is not individually acknowledged. Sensors come from the relay robot only; battery readings are discovery-time snapshots. Global Codiny stop/restart integration remains unverified. Draft block types are not bound to a personal workshop prefix; the observed personal workshop requires `yf61_` and its registered block uses that prefix. No local Blockly test host is included.

See `VALIDATION.md`, `REGISTRATION_KO.md` and `API_KO.md`.
