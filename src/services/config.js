const fs = require('fs')
const homedir = require('homedir')

const getConfig = () => {
  const configFile = `${homedir()}/.time-tracker`

  try {
    if (fs.existsSync(configFile)) {
      return fs.readFileSync(configFile).toString()
    }
  } catch (e) {}

  return 'ws://localhost/'
}

module.exports = getConfig
