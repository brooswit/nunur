const {Minion} = require('Cthulhu')
module.exports = class NunurClient {
  constructor(username, password) {
    this._minion = new Minion()
    this._minion.start()
    this._minion.requestTask('login', {username, password}, (response) => {
      if (response)
    })
  }

  login() {
    new NunurSession()
  }
}