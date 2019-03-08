import Vue from 'vue'
import Router from 'vue-router'

import About from '@/components/About'
import Another from '@/components/Another'
import Browse from '@/components/Browse'
import Compare from '@/components/Compare'
import Details from '@/components/Details'
import Index from '@/components/Index'
import MDA from '@/components/MDA'
import New from '@/components/New'
import Show from '@/components/Show'

import store from '@/store.js'
/* eslint-disable */

Vue.use(Router)

const router  = new Router({
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
    },
    {
      path: '/lol',
      name: 'Another',
      component: Another
    },
    {
      path: '/about',
      name: "About",
      component: About
    },
    {
      path: '/profile/browse',
      name: 'ProfileBrowse',
      component: Browse
    },
    {
      path: '/profile/new',
      name: "ProfileNew",
      component: New
    },
    {
      path: '/profile/:id',
      name: "ProfileShow",
      component: Show
    },
    {
      path: '/profile/details/:id',
      name: "ProfileDetails",
      component: Details
    },
    {
      path: '/profile/compare/:id',
      name: "ProfileCompare",
      component: Compare
    },
    {
      path: '/profile/mda/:id',
      name: "MDA",
      component: MDA
    },
  ]
})

router.beforeEach((to, from, next) => {
  // console.log(to)
  // console.log('to')
  // console.log(from)
  // console.log('from')
  // console.log(next)

  if (to.path.split('/')[1] === '') {
    store.commit('SET_JUMBOTRON_VALUE', true)
  } else if (to.path.split('/')[1] !== 'assets') {
    store.commit('SET_JUMBOTRON_VALUE', false)
  }

  // console.log(store)

  next()
})

export default router
