const WebSocket = require('ws')
const MessageType = require('./src/constants/message-types')
const Message = require('./src/model/Message')
const handler = require('./src/services/websocket')
const getUrl = require('./src/services/config')
const macaddress = require('macaddress')
const ip = require('ip')

const url = getUrl()

console.info(`Connecting to ${url}`)

const socket = new WebSocket(url)

const ipAddress = ip.address()

socket.on('open', () => {
  macaddress.all((err, all) => {
    const macAddress = Object.values(all)
      .find((description) => description.ipv6 === ipAddress || description.ipv4 === ipAddress).mac

    if (!macAddress) {
      console.error('Unable to find MAC')

      process.exit(1)
    }

    console.info(`Found MAC: ${macAddress}`)

    if (err) {
      console.error(err)

      process.exit(2)
    }

    socket.send(Message.create(MessageType.CLIENT_INIT, {macAddress}).toString())
  })
})

socket.on('message', handler(socket))
