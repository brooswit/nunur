const {Process} = require('brooswit-common')
const {Minion} = require('Cthulhu')
module.exports = class NunurClient extends Process {
  constructor(username, password) {
    this._minion = new Minion()
    this._minion.start()
    this._minion.requestTask('authenticate', {identity, password}, (authRes) => {
      this.emit('authenticate', authRes)
    })

  }

  async message(identity, message) {
    if(!await promiseToEmit(this, 'authenticate')) return false
    const {token} = this
    const messageRespo await new Promise((resolve) => {
      this._minion.requestTask('message', {token, identity, message}, resolve)
    })
  }
}
