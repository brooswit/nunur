const {Process} = require('brooswit-common')
const {Minion} = require('Cthulhu')
module.exports = class NunurClient extends Process {
    constructor(identity, password) {
    this._minion = new Minion()
    this._minion.start()
    this._minion.requestTask('authenticate', {identity, password}, (authRes) => {
      this.emit('authenticate', authRes)
    })

  }

  async message(target, message) {
    const authRes = await promiseToEmit(this, 'authenticate')
    const authSuccess = authRes['success']
    if(!authSuccess) return false

    const token = this['token']
    const messageResponse = await new Promise((resolve) => {
      this._minion.requestTask('message', {token, target, message}, resolve)
    })

    messageSuccess = messageResponse['success']
    return messageSuccess
  }
}
