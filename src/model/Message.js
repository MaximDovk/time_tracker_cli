const ErrorTypes = require('../constants/errors')
const Error = require('../errors/Error')

const parse = (data) => {
  try {
    return JSON.parse(data)
  } catch (e) {
    throw new Error(ErrorTypes.MESSAGE_FORMAT, 'Unable to parse JSON message')
  }
}

class Message {
  static create (type, payload = null) {
    return new this(type, payload)
  }

  static fromString (data) {
    const parsed = parse(data)

    if (!parsed.type) {
      throw new Error(ErrorTypes.MESSAGE_FORMAT, 'Message type not found')
    }

    return new this(parsed.type, parsed.payload || null)
  }

  constructor (type, payload = null) {
    this.type = type
    this.payload = payload
  }

  toString () {
    const data = {
      type: this.type
    }

    if (this.payload) {
      data.payload = this.payload
    }

    return JSON.stringify(data)
  }
}

module.exports = Message
