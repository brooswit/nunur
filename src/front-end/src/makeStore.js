import Vuex from 'Vuex';
import { dispatch } from 'rxjs/internal/observable/range';

disconnected = 0
ready = 1
connecting = 2
connected = 3

connotSetIdentity = 'cannot change identifier input while connecting or connected'
connotSetPassword = 'cannot change password input while connecting or connected'

export default function makeStore(xws) {
  return new Vuex.Store({
    state: {
      count: 0
    },
    mutations: {
      setIdentifier (state, newIdentifier) {
        if(state.state >= connecting) {
          return console.warn(connotSetIdentity)
        }
        state.identifier = newIdentifier
      },
      setPassword(state, newPassword) {
        if(state.state >= connecting) {
          return console.warn(connotSetPassword)
        }
        state.password = newPassword
      }
    },
    getters: {
      getIdentifier: (state) => {
        return state.identifier
      },
      getPassword: (state) => {
        return state.password
      }
    },
    actions: {
      async login ({dispatch, commit, state}) {
        await dispatch('logout')

        commit('enterLoggingInState')
        // begin short circuit
        if (true) {
          // all requests are treated as valid responses, and are "new users"
          commit('enterLoggedInState', Date.now(), true)
        }
        // end short circuit
        const response = await new Promise((resolve) => {
          xws.request('authenticate', {
            identifier: state.identifier,
            password: state.password
          }, resolve)
        })
        const {success, token, isNew} = response
        if (success) {
          commit('enterLoggedInState', token, isNew)
        } else {
          commit('enterDisconnectedInState')
        }
      },
      async logout({commit}) {
          commit('enterDisconnectedInState')
      },
      async message({commit}) {
        return async(recipient, type, payload) {
          // todo
        }
      }
    }
  });
}
