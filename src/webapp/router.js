import VueRouter from 'vue-router'

import RouteMain from './components/RouteMain'
import RouteManage from './components/RouteManage'
import RouteProfile from './components/RouteProfile'
const router = new VueRouter({
  routes: [{
    path: '/',
    component: RouteMain
  }, {
    path: '/manage',
    component: RouteManage
  }, {
    path: '/:nunurAddress',
    component: RouteProfile
  }]
})

export default router
