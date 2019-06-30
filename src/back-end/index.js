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

let eventEmitter = new EventEmitter()
// setup ws
enableWs(expressApp)

async function authenticate(identifier , authentication, tokenId = null) {
  let session = await fetchUser(identifier) || await newUser(identifier, authentication)
  session.token = tokenId ? await fetchToken(identifier, tokenId) : null
  if (!await verify(session, authentication)) return null
  session.token |= await newToken(session)
  await saveSession(session)
  return session

  async function fetchUser(identifier) {
    console.warn('fetch user')
    return await new Promise(async(resolve) => {
      redis.hget('user', identifier, async (err, userJson) => {
        if (err) throw err
        let userData = safeJSON.parse(userJson, null)
        if(userData) {
          userData.identifier = identifier
          if(!userData.hash) userData = null;
        }
        resolve(userData)
      })
    })
  }

  async function newUser(identifier, authentication) {
    console.warn('new user')
    return await new Promise(async(resolve) => {
      crypto.randomBytes(16, async (err, salt) => {
        if (err) throw err
        let hash = await argon2i.hash(authentication, salt)
        resolve({identifier, hash})
      })
    })
  }

  async function verify(session, authentication) {
    return await argon2i.verify(session.token ? session.token.hash : token.hash, authentication)
  }

  async function saveSession(session) {
    console.warn('save session')
    await Promise.all([
      new Promise((resolve) => {
        let userJson = JSON.stringify({
          hash: session.hash
        })
        redis.hset('user', session.identifier, userJson, async (err) => {
          if (err) throw err
          resolve()
        })
      }),
      new Promise((resolve) => {
        let tokenJson = JSON.stringify({ 
          userIdentifier: session.identifier,
          hash: session.token.hash
        })
        redis.hset('token', session.id, tokenJson, async (err) => {
          if (err) throw err
          resolve()
        })
      }),
    ])
  }

  async function fetchToken(userIdentifier, tokenId) {
    return await new Promise(async(resolve) => {
      redis.hget('token', tokenId, async (err, tokenJson) => {
        if (err) throw err
        let tokenData = safeJSON.parse(tokenJson, null)
        if(tokenData) {
          tokenData.id = tokenId
          if (!tokenData.hash
            || !tokenData.userIdentifier
            || tokenData.userIdentifier != userIdentifier
          ) {
            userData = null
          }
        }

        resolve(tokenData)
      })
    })
  }

  async function newToken(userIdentifier) {
    return await new Promise((resolve) => {
      crypto.randomBytes(16, async (err, secret) => {
        if (err) throw err
        
        let hash = await argon2i.hash(authentication, secret)
        resolve({userIdentifier, secret, hash})
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
