<template>
  <div class="nunur">
    <link rel="stylesheet" type="text/css" :href="$store.getters.currentUserView.themeUrl" />
    <b-container fluid class="p-0">
      <b-row >
        <b-col>
          <topRow/>
        </b-col>
      </b-row>
      <b-row >
        <b-col>
          <isInitializedWrapper>
            <router-view></router-view>
          </isInitializedWrapper>
        </b-col>
      </b-row>
      <b-row  align-v="end">
        <b-col>
          <bottomRow/>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  name: 'AppNunur',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>
