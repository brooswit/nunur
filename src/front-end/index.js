// import 'es6-promise/auto'
import 'babel-polyfill'

import './css/main.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import config from './config'

import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import Vuex from 'vuex'
const { mapActions, mapState } = Vuex

import Main from './vues/Main.vue'

import {extendWs} from 'js-common'
Vue.use(BootstrapVue)
Vue.use(Vuex)

const dev_shortCircuitLogin = false

let xws = null

const CONNECTION_STATE_NOT_CONNECTED = 0
const CONNECTION_STATE_DISCONNECTED = 1
const CONNECTION_STATE_CONNECTING = 2
const CONNECTION_STATE_CONNECTED = 3
const CONNECTION_STATE_LOGGED_OUT = 4
const CONNECTION_STATE_LOGGING_IN = 5
const CONNECTION_STATE_LOGGED_IN = 6

const connotSetIdentity = 'cannot change identifier while CONNECTION_STATE_LOGGING_IN or CONNECTION_STATE_LOGGED_OUT'
const connotSetAuthentication = 'cannot change athentication while CONNECTION_STATE_LOGGING_IN or CONNECTION_STATE_LOGGED_OUT'

const store = new Vuex.Store({
  state: {
    connectionState: CONNECTION_STATE_NOT_CONNECTED,
    isNewUser: true,
    identifier: "",
    authentication: "",
    messages: [],
    target: "",
    messageType: "chat",
    messageContent: "",
  },
  getters: {
    contacts: (state) => {
      let contacts = []
      
      for (var messageIndex in state.messages) {
        let message = state.messages[messageIndex]
        if (message.sender !== state.identifier && contacts.indexOf(message.sender) == -1) {
          contacts.push(message.sender)
        }
        if (message.recipient !== state.identifier && contacts.indexOf(message.recipient) == -1) {
          contacts.push(message.recipient)
        }
      }

      return contacts
    },
    targetMessages: (state) => {
      var messages = []
      for (var messageIndex in state.messages) {
        let message = state.messages[messageIndex]
        const hasSelf = state.identifier === message.sender || state.identifier === message.recipient
        const hasTarget = state.target === message.sender || state.target === message.recipient

        if (hasSelf && hasTarget) {
          messages.unshift(message)
        }
      }
      console.warn({messages})
      return messages
    },
  },
  mutations: {
    SET_TARGET: (state, {target}) => {
      state.target = target
    },
    SET_MESSAGE_TYPE: (state, {messageType}) => {
      console.warn({messageType})
      state.messageType = messageType
    },
    SET_MESSAGE_CONTENT: (state, {messageContent}) => {
      console.warn({messageContent})
      state.messageContent = messageContent
    },
    setTarget (state, {target}) {
      state.target = target
    },
    setIdentifier (state, {identifier}) {
      state.identifier = identifier
    },
    setAuthentication(state, {authentication}) {
      state.authentication = authentication
    },
    setMessageType(state, {messageType}) {
      state.messageType = messageType
    },
    setMessageContent(state, {messageContent}) {
      state.messageContent = messageContent
    },
    changeConnectionState(state, {connectionState, isNewUser=true}) {
      console.warn("new state is " + connectionState)
      state.connectionState = connectionState
      state.isNewUser = isNewUser
    },
  },
  actions: {
    async save({state}) {
      console.warn('saving')
      localStorage.setItem('nunur:' + state.identifier, JSON.stringify(state.messages))
      console.warn('saved')
    },
    async load({state}) {
      console.warn('loading')
      try {
        state.messages = JSON.parse(localStorage.getItem('nunur:' + state.identifier)) || []
        console.warn('loaded')
      } catch(e) {
        console.warn('load fail ', e)
        state.messages = []
      }
    },
    async connect({state, dispatch}) {
      await dispatch('disconnect')
      console.warn('CONNECTION_STATE_CONNECTING')
      xws = new WebSocket(config['baseUrl'] + '/stream')
      extendWs(xws, true)
      await dispatch('changeConnectionState', { connectionState: CONNECTION_STATE_CONNECTING })
      xws.on('open', async() => {
        await dispatch('changeConnectionState', {connectionState: CONNECTION_STATE_CONNECTED})
        if (state.identifier && state.authentication) { await dispatch('login') }
      })
      xws.on('dm', async({sender, type, content}) => { await dispatch('recieveMessage', {sender, type, content}) })
      xws.on('close', async() => { await dispatch('reconnect') })
    },
    async disconnect() {
      if(!xws) { return }
      console.warn('disconnecting')
      xws.close()
      xws = null
      store.dispatch('changeConnectionState', { connectionState: CONNECTION_STATE_DISCONNECTED})
    },
    async reconnect({dispatch}) {
      console.warn('reconnecting')
      await dispatch('connect', true)
      console.warn('reconnected')
    },
    async setTarget({commit, state}, {target}) {
      console.warn('action setTarget: ', target)
      commit('setTarget', {target})
    },
    async setIdentifier({commit, state}, {identifier}) {
      if(state.connectionState >= CONNECTION_STATE_LOGGING_IN) { return console.warn(connotSetIdentity) }
      commit('setIdentifier', {identifier})
    },
    async setAuthentication({commit, state}, {authentication}) {
      if(state.connectionState >= CONNECTION_STATE_LOGGING_IN) { return console.warn(connotSetAuthentication) }
      commit('setAuthentication', {authentication})
    },
    async setMessageType({commit}, {messageType}) {
      commit('setMessageType', {messageType})
    },
    async setMessageContent({commit}, {messageContent}) {
      commit('setMessageContent', {messageContent})
    },
    async login ({dispatch, state}) {
      await dispatch('logout')
      await dispatch('changeConnectionState', {connectionState: CONNECTION_STATE_LOGGING_IN})

      const {success, isNewUser} = await new Promise((done) => {
        if (dev_shortCircuitLogin) { 
          done({success: true, isNewUser:true})
        } else {
          const {identifier, authentication} = state
          xws.sendRequest('login', {identifier , authentication}, done)
        }
      })

      console.warn('lotin success ' + success)

      if (success) {
        await dispatch('load')
      }

      const connectionState = success ? CONNECTION_STATE_LOGGED_IN : CONNECTION_STATE_LOGGED_OUT
      await dispatch('changeConnectionState', { connectionState, isNewUser})
      await dispatch('sendStatus', {status: 'online'})
    },
    async logout({state, dispatch}) {
      if(state.connectionState === CONNECTION_STATE_LOGGED_IN){ xws.sendEvent('logout') }
      dispatch('changeConnectionState', {connectionState: CONNECTION_STATE_LOGGED_OUT})
    },
    async sendMessage({state, dispatch}, options) { 
      const sender = state.identifier
      const recipient = (options && options.target) || state.target
      const type = (options && options.type) || state.messageType
      const content = (options && options.content) || state.messageContent
      const log = (options && options.log) && (typeof options.log === "boolean" ? options.log : true)
      state.messageType = "chat"
      state.messageContent = ""

      console.warn({recipient, type, content})

      return await new Promise((done) => {
        xws.sendRequest('dm', { recipient, type, content }, () => {
          console.warn('message sent')
          if(log) {
            dispatch('registerMessage', { sender, recipient, type, content })
          }
          done()
        })
      })
    },
    async sendStatus({dispatch, getters}, {status}) {
      for(let contactIndex in getters.contacts) {
        const contact = getters.contacts[contactIndex]
        dispatch('sendMessage', {
          target: contact,
          type: 'status',
          content: status,
          log: false
        })
      }
    },
    async recieveMessage({dispatch, state}, {sender, type, content}) {
      console.warn('receiving message')
      const recipient = state.identifier
      dispatch('registerMessage', { sender, recipient, type, content })
    },
    async registerMessage({state, dispatch}, {sender, recipient, type, content}) {
      console.warn('register message')
      state.messages.push({sender, recipient, type, content})
      await dispatch('save')
    },
    async changeConnectionState({commit}, { connectionState, isNewUser }) {
      commit('changeConnectionState', { connectionState, isNewUser })
    },
  }
})

new Vue({
	el: '#app',
  store,
  render: h => h(Main),
  computed: mapState({
    state: state => state.connectionState,
    isNewUser: state => state.isNewUser,
    identifier: state => state.identifier,
    authentication: state => state.authentication,
    remoteData: state => {
      return { identify, hashedPassword: "-omitted-" }
    },
    localData: state => {
      return localStorage.getItem('nunur:' + state.identifier)
    },
  }),
  methods: mapActions([
    'connect',
    'disconnect',
    'reconnect',
    'setIdentifier',
    'setAuthentication',
    'login',
    'logout',
    'sendMessage',
    'recieveMessage',
    'changeConnectionState',
  ]),
  filters: {
    reverse: (value) => {
      return value.slice().reverse()
    },
  },
  created () {
    this.$store.dispatch('connect')
  },
})
