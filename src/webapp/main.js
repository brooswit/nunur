// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'

import Vue from 'vue'
import Vuex from 'vuex'

import App from './App'

import MakeRouter from './MakeRouter'
import MakeStore from './MakeStore'

Vue.use(Vuex)
Vue.config.productionTip = false

const el = '#app'
const render = h => h(App)
const store = MakeStore(vue)
const router = MakeRouter(vue)

/* eslint-disable no-new */
new Vue({el, render, router, store})
