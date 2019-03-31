const express = require('express')
const bodyParser = require('body-parser')
const enableWs = require('express-ws')
const {extendWs} = require('js-common')
// setup express
const expressApp = express()
expressApp.use(bodyParser.json())
expressApp.use(express.static('public'))

// setup ws
enableWs(expressApp)
expressApp.ws('/stream', ws => {
  extendWs(ws)
  console.log('ws client')
})

// listen
expressApp.listen(process.env.PORT, () => {
  console.log('listening')
})
