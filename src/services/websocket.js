const Message = require('../model/Message')
const ErrorType = require('../constants/errors')
const MessageType = require('../constants/message-types')
const {spawn} = require('child_process')

const messageHandlers = {
  [MessageType.INIT]: () => {
    console.info('Connected')
  },
  [MessageType.OPEN]: async (socket, payload) => {
    const chromeCli = spawn('/usr/local/bin/chrome-cli', ['open', payload.url])

    const id = +await new Promise((resolve) => {
      chromeCli.stdout.on('data', resolve)
    }).then(data => data.toString())
      .then(output => output.match(/Id: (\d+)/)[1])

    console.info(`Opened new tab: ${id}`)
  }
}

const handler = (socket) => (messageString) => {
  try {
    const message = Message.fromString(messageString)

    const messageHandler = messageHandlers[message.type]

    if (!messageHandler) {
      console.error(`Handler for type ${message.type} not found`)

      return
    }

    messageHandler(socket, message.payload)
  } catch (e) {
    if (e.code === ErrorType.MESSAGE_FORMAT) {
      console.error(e.message)

      return
    }

    throw e
  }
}

module.exports = handler
