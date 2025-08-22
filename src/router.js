import Router from 'vue-router'

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: resolve => require(['./views/home.vue'], resolve),
    }
  ]
})
