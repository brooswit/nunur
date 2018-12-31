const express = require('express');
const path = require('path');

module.exports = exports = function NunurWebAppServer(nunur, config) {
  var options = {
    port: config.port || 5000
  }
  express()
    .use(express.static(path.join(__dirname, 'build')))
    .use(express.static(path.join(__dirname, 'public')))
    // .set('views', path.join(__dirname, 'views'))
    // .set('view engine', 'ejs')
    // .get('/', (req, res) => res.render('pages/index'))
    .listen(options.port, () => console.log(`Nunur WebApp Server listening on ${ options.port }`));
}
