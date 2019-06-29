<template>
  <v-container id="app">
    <v-toolbar dark color="primary">
      <v-toolbar-title class="white--text">NUNUR</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <v-container fluid v-if="connectionState<=1">
      <v-layout column>
        <v-flex>
          Disconnected...
        </v-flex>
      </v-layout>
    </v-container>
    <v-container fluid v-if="connectionState===2">
      <v-layout column>
        <v-flex>
          Connecting...
        </v-flex>
      </v-layout>
    </v-container>
    <v-container fluid v-if="connectionState===3 || connectionState===4">
      <v-layout column>
        <v-flex>
          <span v-if="connectionState===4">Logged out</span></br>
          identifier: <input :value="identifier" @input="setIdentifier"><br/>
          authentication: <input type="password" :value="authentication" @input="setAuthentication"><br/>
          <button @click="login()">Login</button>
        </v-flex>
      </v-layout>
    </v-container>
    <v-container fluid v-if="connectionState===5">
      <v-layout column>
        <v-flex>
          Logging in...
        </v-flex>
      </v-layout>
    </v-container>
    <v-container fluid v-if="connectionState===6">
      <v-layout column>
        <v-flex>
          Contacts:<br/>
          <li v-for="contact in contacts" @click="setTarget($event, contact)">
            {{ contact }}
          </li>

          Chat:<br/>
          Target: <input :value="target" @input="setTargetByValue"><br/>
          Messages:<br/>
          <li v-for="message in targetMessages">
            {{ message }}<br/>
          </li><br/>
          Message Type: <input :value="messageType" @input="setMessageType"><br/>
          Message Content: <input :value="messageContent" @input="setMessageContent"><br/>
          <button @click="sendMessage()">Send Message</button><br/>

          Settings:<br/>
        </v-flex>
      </v-layout>
    </v-container>
  </v-container>
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
      setTargetByValue(event) { this.$store.dispatch('setTarget', { target: event.target.value }) },
      setTarget(event, target) { this.$store.dispatch('setTarget', { target }) },
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