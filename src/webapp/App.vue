<template>
  <div id="app">
    <AppNunur></AppNunur>
  </div>
</template>

<script>
import AppNunur from './components/AppNunur'

export default {
  name: 'App',
  components: {
    AppNunur
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
