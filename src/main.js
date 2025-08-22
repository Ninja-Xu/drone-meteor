import Vue from 'vue'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import VueCesium from 'vue-cesium'
import App from './App.vue'
import router from './router'
Vue.use(VueCesium, {
  // cesiumPath 是指引用的Cesium.js路径，如
  // 项目本地的Cesium Build包，vue项目需要将Cesium Build包放static目录：
  cesiumPath: "/static/Cesium/Cesium.js",
  // 个人在线Cesium Build包：
  // cesiumPath: 'https://zouyaoji.top/vue-cesium/statics/Cesium/Cesium.js'
  // 个人在线SuperMap Cesium Build包（在官方基础上二次开发出来的）：
  // cesiumPath: 'https://zouyaoji.top/vue-cesium/statics/SuperMapCesium/Cesium.js'
  // 官方在线Cesium Build包，有CDN加速，推荐用这个：
  // cesiumPath: 'https://unpkg.com/cesium/Build/Cesium/Cesium.js',
  // 指定Cesium.Ion.defaultAccessToken，使用Cesium ion的数据源需要到https://cesium.com/ion/申请一个账户，获取Access Token。不指定的话可能导致 Cesium 在线影像加载不了
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZTA0MDk5Zi04YmZhLTQ1ZWUtOGI0Yi1hMzA3ODI4MDc4M2YiLCJpZCI6MjY4NTYsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1ODg0MTAwMzl9.3R-BBPD7UoiU6LzHfWGxj_moI4SirhT8UWbROUPGVMw'
})

Vue.use(VueRouter)
Vue.use(ElementUI);

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router,
}).$mount('#app')
