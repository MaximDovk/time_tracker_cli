const Message = require('../model/Message')
const ErrorType = require('../constants/errors')
const MessageType = require('../constants/message-types')
const {spawn} = require('child_process')
const os = require('os')
const commandExistsSync = require('command-exists').sync

const useChromeUtils = commandExistsSync('/usr/local/bin/chrome-cli')

const displayStatus = (code) => {
  console.info(`Open command exited with code: ${code}`)
}

const openTab = async (url) => {
  const platform = os.platform()

  switch (platform) {
    case 'darwin':
      if (useChromeUtils) {
        const chromeCli = spawn('/usr/local/bin/chrome-cli', ['open', url])

        const id = +await new Promise((resolve) => {
          chromeCli.stdout.on('data', resolve)
        }).then(data => data.toString())
          .then(output => output.match(/Id: (\d+)/)[1])

        console.info(`Opened new tab: ${id}`)
      } else {
        spawn('open', [url]).on('close', displayStatus)
      }

      break
    case 'linux':
      spawn('xdg-open', [url]).on('close', displayStatus)

      console.info('If tab haven\'t opened check that "xdg-open" util is working on your system')

      break
    case 'win32':
      spawn('start', [url]).on('close', displayStatus)

      console.info('If tab haven\'t opened check that "start" util is working on your system')

      break
    default:
      console.error('Your platform is not supported')
  }
}

const messageHandlers = {
  [MessageType.INIT]: () => {
    console.info('Connected')
  },
  [MessageType.OPEN]: async (socket, payload) => {
    await openTab(payload.url)
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
