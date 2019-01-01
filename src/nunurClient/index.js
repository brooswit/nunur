const {Process} = require('brooswit-common')
const {Minion} = require('Cthulhu')
module.exports = class NunurClient extends Process {
  this._minion = new Minion()
    constructor(username, password) {
    this._minion.start()
    this._minion.requestTask('authenticate', {identity, password}, (authRes) => {
      this.emit('authenticate', authRes)
    })

  }

  async message(identity, message) {
    const authSuccess = authRes.
    if(!await promiseToEmit(this, 'authenticate')) return false
    const {token} = this
    const messageResponse = await new Promise((resolve) => {
      this._minion.requestTask('message', {token, identity, message}, resolve)
    })

    messageSuccess = messageResponse['success']


  }
}
