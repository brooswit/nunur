const {Process} = require('brooswit-common')
const {Minion} = require('Cthulhu')
module.exports = class NunurClient extends Process {
  constructor(username, password) {
    this._minion = new Minion()
    this._minion.start()
    this._minion.requestTask('authenticate', {username, password}, (authResp) => {
      this.emit('authenticate_response', authResp)
      }
      else {
        this.emit('authenticate_')
      }
    })
  }


}