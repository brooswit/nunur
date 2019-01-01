const {Process} = require('brooswit-common')
const {Minion} = require('Cthulhu')
module.exports = class NunurClient extends Process {
  constructor(username, password) {
    this._minion = new Minion()
    this._minion.start()
    this._minion.requestTask('authenticate', {identity, password}, (authRes) => {
      this.emit('authenticate_response', authRes)
    })

  }

  async message(identity) {
    if(!await promiseToEmit(this, ))
  }

}