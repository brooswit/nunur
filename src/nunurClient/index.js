const {Process} = require('js-common')
const {Minion} = require('Cthulhu')
module.exports = class NunurClient extends Process {
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