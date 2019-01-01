const {Process} = require('brooswit-common')
const {Minion} = require('Cthulhu')
module.exports = class NunurClient extends Process {
  constructor(url, identity, password) {
    super(async (process) => {
      this.promiseToAuthenticate = promiseToEmit(this, 'authenticate')

      this._minion = new Minion(url)
      this._minion.start()

      const authRes = await new Promise((resolve) => {
        this._minion.requestTask('authenticate', {identity, password}, resolve)
      })
      this.emit('authenticate', authRes)
      if(!authRes.success) return this.close()
    })
  }

  async message(target, message) {
    const authRes = await this.promiseToAuthenticate
    const authSuccess = authRes['success']
    if(!authSuccess) return false

    const token = authRes['token']
    const messageResponse = await new Promise((resolve) => {
      this._minion.requestTask('message', {token, target, message}, resolve)
    })

    messageSuccess = messageResponse['success']
    return messageSuccess
  }
}
