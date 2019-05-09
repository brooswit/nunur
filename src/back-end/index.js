const bcrypt = require('bcrypt');
const redis = require('redis').createClient(process.env.REDIS_URL);
const EventEmitter = require('events')
const express = require('express')
const bodyParser = require('body-parser')
const enableWs = require('express-ws')
const {extendWs} = require('js-common')
// setup express
const expressApp = express()
expressApp.use(bodyParser.json())
expressApp.use(express.static('./build/public'))

let users = []

let eventEmitter = new EventEmitter()
// setup ws
enableWs(expressApp)

async function getUser(identifier , rawAuthentication) {
  let storeType = "redis"
  let user = null
  bcrypt.hash(rawAuthentication, process.env.PASSWORD_SALT || "nunur", function(err, authentication) {
    if(storeType === "none") {
      if (!users[identifier]) {
        users[identifier] = {authentication}
      }
      user = users[identifier]
    } else if (storeType === "redis") {
      user = await new Promise((resolve)=>{
        redis.hget('user', identifier, async (err, user) => {
          if (!user) {
            user = {authentication}
            await new Promise((resolve)=>{
              redis.hset('user', identifier, user, resolve)
            })
          }
          resolve(user)
        })
      })
    }

  })

  if (!user || users.authentication !== authentication) {
    user = null
  }

  return user
}

expressApp.ws('/stream', ws => {
  extendWs(ws, true)
  ws.on('login', ({identifier , authentication}, remoteMessageId) => {
    const user = await getUser(identifier, authentication)
    const success = !!user
    if(user) {
      ws.identifier = identifier
      const messageHandler = ({sender, type, content}) => {
        console.warn('handled message from ' + sender + ' to ' + identifier)

        ws.sendEvent('dm', {sender, type, content})
      }
      eventEmitter.on(identifier, messageHandler)
      ws.on('close', () => {
        eventEmitter.off(identifier, messageHandler)
      })
    }
    ws.sendResponse(remoteMessageId, {success})
  })
  ws.on('dm', ({ recipient, type, content }, remoteMessageId) => {
    console.warn('test')
    if (!ws.identifier) return console.warn('no identifier')
    console.warn('recieved message from ' + ws.identifier + ' to ' + recipient)
    eventEmitter.emit(recipient, {
      sender: ws.identifier,
      type, content
    })
    ws.sendResponse(remoteMessageId, { recipient, type, content })
  })
})

// listen
const port = process.env.PORT || 8080
expressApp.listen(port || 8080, () => {
  console.log('listening on port ' + port || 8080)
})
