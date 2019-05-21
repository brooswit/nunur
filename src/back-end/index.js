var crypto = require('crypto');
var argon2i = require('argon2-ffi').argon2i;

const redis = require('redis').createClient(process.env.REDIS_URL);
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

async function getUser(identifier , authentication) {
  let valid = null

  console.warn('====getUser====')

  // Get User
  let user = await new Promise(async(resolve) => {
    redis.hget('user', identifier, async (err, userJson) => {
      if (err) {
        console.warn(err)
        throw err;
      }
      let userData = safeJSON.parse(userJson, {})
      resolve(userData)
    })
  })

  console.warn('checking auth')
  // Generate hash if User doesn't exist
  if (!user.authentication) {
    await new Promise((resolve) => {
      crypto.randomBytes(16, async (err, salt) => {
        if (err) throw err;
        argon2i.hash(authentication, salt, async (err, hash) => {
          if (err) throw err;
          user.authentication = hash
          resolve()
        })
      })
    })
  }
  console.log('got user: ', {user})

  // Determine if User is Valid
  valid = await new Promise((resolve) => {
    argon2i.verify(user.authentication, authentication, async (err) => {
      resolve(!err)
    });
  })
  console.log('valid: ', {valid})

  // Update User if Valid
  if (valid) {
    await new Promise((resolve) => {
      let userJson = JSON.stringify(user)
      redis.hset('user', identifier, userJson, async (err) => {
        if (err) { throw err }
        resolve()
      })
    })
  }

  console.warn('got user: ', {user, valid})

  return valid ? user : null
}

expressApp.ws('/stream', async ws => {
  extendWs(ws, true)
  ws.on('login', async ( {identifier , authentication}, remoteMessageId) => {
    const user = await getUser(identifier, authentication)
    const success = !!user
    if(user) {
      ws.identifier = identifier
      const messageHandler = async ({sender, type, content}) => {
        console.warn('handled message from ' + sender + ' to ' + identifier)

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
expressApp.listen(port || 8080, async () => {
  console.log('listening on port ' + port || 8080)
})
