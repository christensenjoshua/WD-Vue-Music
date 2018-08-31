import Vue from 'vue'
import Router from 'vue-router'
import Dashboard from '@/components/Dashboard'
import Register from '@/components/Register'
import Login from '@/components/Login'
import store from '../store'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/dashboard',
      name: 'Dashboard',
      beforeEnter(to, from, next) {
        if (store.state.user.email) {
          return next()
        }
        return next('/login')
      },
      component: Dashboard
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    }
  ]
})
