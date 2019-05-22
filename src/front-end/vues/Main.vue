<template>
  <div id="app">
    <div v-if="connectionState<=1">
      Disconnected...
    </div>
    <div v-if="connectionState===2">
      Connecting...
    </div>
    <div v-if="connectionState===3 || connectionState===4">
      <span v-if="connectionState===4">Logged out</span></br>
      identifier: <input :value="identifier" @input="setIdentifier"><br/>
      authentication: <input type="password" :value="authentication" @input="setAuthentication"><br/>
      <button @click="login()">Login</button>
    </div>
    <div v-if="connectionState===5">
      Logging in...
    </div>
    <div v-if="connectionState===6">
      Contacts:<br/>
      <li v-for="contact in contacts" @click="setTarget" @value="contact">
        {{ contact }}<br/>
      </li>

      Chat:<br/>
      Target: <input :value="target" @input="setTarget"><br/>
      Messages:<br/>
      <li v-for="message in targetMessages">
        {{ message }}<br/>
      </li><br/>
      Message Type: <input :value="messageType" @input="setMessageType"><br/>
      Message Content: <input :value="messageContent" @input="setMessageContent"><br/>
      <button @click="sendMessage()">Send Message</button><br/>

      Settings:<br/>
    </div>
  </div>
</template>

<script>
  import Vue from "vue";
  import { mapState, mapGetters, mapActions, } from 'vuex'

  export default Vue.extend({
    computed: {
      ...mapState([
        'connectionState',
        'isNewUser',
        'identifier',
        'authentication',

        'target',
        'messageType',
        'messageContent',
      ]),
      ...mapGetters([
        'contacts',
        'targetMessages',
      ]),
  },
    methods: {
      setIdentifier(event) { this.$store.dispatch('setIdentifier', {identifier: event.target.value}) },
      setAuthentication(event) { this.$store.dispatch('setAuthentication', {authentication: event.target.value}) },
      login(event) { this.$store.dispatch('login') },
      setTarget(event) { this.$store.dispatch('setTarget', { target: event.target.value }) },
      setMessageType(event) { this.$store.dispatch('setMessageType', { messageType: event.target.value }) },
      setMessageContent(event) { this.$store.dispatch('setMessageContent', { messageContent: event.target.value }) },
      sendMessage(event) { this.$store.dispatch('sendMessage') },
    },
  });
</script>

<style scoped>
  .container {
    color: green;
  }
</style>