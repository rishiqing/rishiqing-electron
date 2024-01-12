import Events from 'node:events'
import { ViewEvent } from './eventMessage'

let forceClose = false
const eventEmitter = new Events()

eventEmitter.on(ViewEvent.setForceClose, (data) => (forceClose = data))

export { forceClose, eventEmitter }
