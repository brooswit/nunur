const {Minion} = require('Cthulhu')
module.exports = class NunurClient extends process{
  constructor(username, password) {
    this._minion = new Minion()
    this._minion.start()
    this._minion.requestTask('login', {username, password}, (success) => {
      if (success) {

      }
    })
  }

  login() {
    new NunurSession()
  }
}