import type { ConnectionState, IHPetCommandRunner, IHPetContext } from '@ktaicoder/hw-pet'
import { HPetNotifyEventKeys } from '@ktaicoder/hw-pet'
import { RobotController } from './RobotController'

/** Same controller is used by the local test UI and Codiny command methods. */
export class CommandRunner extends RobotController implements IHPetCommandRunner {
  private unsubscribe?: () => void
  constructor(private context: IHPetContext) { super() }
  init = async (): Promise<void> => {
    let previous: ConnectionState | undefined
    const report = () => {
      const state = this.getSnapshot().connection
      if (state === previous) return
      previous = state
      this.context.notifyEvents.emit(HPetNotifyEventKeys.connectionStateChanged, state)
      this.context.toParent.notifyConnectionState(state)
    }
    this.unsubscribe = this.subscribe(report)
    report()
  }
  destroy = async (): Promise<void> => {
    await this.disconnect()
    this.unsubscribe?.()
    this.unsubscribe = undefined
  }
  getHwId = async (): Promise<string> => this.context.hwId
  getConnectionState = async (): Promise<ConnectionState> => this.getSnapshot().connection
  echo = async (message: string): Promise<string> => message
}
