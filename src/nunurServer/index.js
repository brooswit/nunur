const Cthulhu = require('Cthulhu')

module.exports = class NunurServer {
  constructor() {
    this._cthulhu = new Cthulhu()
  }

  start(callback) {
    this._cthulhu.start(callback)
  }
}
