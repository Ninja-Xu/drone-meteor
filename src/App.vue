<template>
  <div id="app">
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>
<script>
export default {
  name: "App",
  data() {
    return {};
  },
};
</script>

<style lang="less">
@import url("@/styles/reset.less");
.cesium-widget-credits {
  display: none !important;
}

.vc-html-container {
  display: none;
  position: absolute;
  // pointer-events: none;
  z-index: 66;
}

.vc-html-bubble {
  width: 320px;
  line-height: 30px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 8px 16px;
}
#app {
  width: 1920px;
  height: 1080px;
  background: url("./assets/bg.png") center no-repeat;
  background-size: 100% 100%;
  padding: 26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  .title {
    width: 466px;
  }
  main {
    margin-top: 6px;
    width: 100%;
    flex: 1;
  }
}
</style>
