var crypto = require('crypto')
var argon2i = require('argon2-ffi').argon2i

const redis = require('redis').createClient(process.env.REDIS_URL)
const EventEmitter = require('events')
const express = require('express')
const bodyParser = require('body-parser')
const enableWs = require('express-ws')
const {safeJSON, extendWs} = require('js-common')
// setup express
const expressApp = express()
expressApp.use(bodyParser.json())
expressApp.use(express.static('./build/public'))

let users = []

let eventEmitter = new EventEmitter()
// setup ws
enableWs(expressApp)

async function authenticate(identifier , authentication) {
  let user = await fetchUser(identifier) || await newUser(authentication)
  let valid = await verify(user, authentication)
  if(valid) await saveUser(identifier, user)
  return valid ? user : null
  
  async function fetchUser(identifier) {
    console.warn('fetch user')
    return await new Promise(async(resolve) => {
      redis.hget('user', identifier, async (err, userJson) => {
        if (err) {
          throw err
        }
        let userData = safeJSON.parse(userJson, null)
        resolve(userData)
      })
    })
  }

  async function newUser(authentication) {
    console.warn('new user')
    return await new Promise(async(resolve) => {
      crypto.randomBytes(16, async (err, salt) => {
        if (err) {
          throw err
        }
        let hash = argon2i.hash(authentication, salt)
        resolve({hash})
      })
    })
  }

  async function verify(user, authentication) {
    console.warn('verify: ' + user.authenticate)
    return await argon2i.verify(user.authentication, authentication)
  }

  async function saveUser(identifier, user) {
    console.warn('save user')
    await new Promise((resolve) => {
      let userJson = JSON.stringify(user)
      redis.hset('user', identifier, userJson, async (err) => {
        if (err) {
          throw err
        }
        resolve()
      })
    })
  }
}

expressApp.ws('/stream', async ws => {
  extendWs(ws, true)
  ws.on('login', async ( {identifier , authentication}, remoteMessageId) => {
    const user = await authenticate(identifier, authentication)
    const success = !!user
    if(user) {
      ws.identifier = identifier
      const messageHandler = async ({sender, type, content}) => {

        ws.sendEvent('dm', {sender, type, content})
      }
      eventEmitter.on(identifier, messageHandler)
      ws.on('close', async () => {
        eventEmitter.off(identifier, messageHandler)
      })
    }
    ws.sendResponse(remoteMessageId, {success})
  })
  ws.on('dm', async ({ recipient, type, content }, remoteMessageId) => {
    if (!ws.identifier) return
    eventEmitter.emit(recipient, {
      sender: ws.identifier,
      type, content
    })
    ws.sendResponse(remoteMessageId, { recipient, type, content })
  })
})

// listen
const port = process.env.PORT || 8080
expressApp.listen(port || 8080, async () => {
  console.log('listening on port ' + port || 8080)
})
