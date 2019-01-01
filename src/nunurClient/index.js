const {Process} = require('brooswit-common')
const {Minion} = require('Cthulhu')
module.exports = class NunurClient extends Process {
  constructor(username, password) {
    this._minion = new Minion()
    this._minion.start()
    this._minion.requestTask('authenticate', {username, password}, (success) => {
      if (success) {
        this.emit('authenticate_success')
      }
      else {
        this.emit('authenticate_')
      }
    })
  }


}