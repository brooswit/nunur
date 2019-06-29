<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand>NUNUR.biz</b-navbar-brand>
    </b-navbar>
    <b-container fluid v-if="connectionState<=1">
      <b-row>
        <b-col>
          Disconnected...
        </b-col>
      </b-row>
    </b-container>
    <b-container fluid v-if="connectionState===2">
      <b-row>
        <b-col>
          Connecting...
        </b-col>
      </b-row>
    </b-container>
    <b-container fluid v-if="connectionState===3 || connectionState===4">
      <b-row>
        <b-col>
          <span v-if="connectionState===4">Logged out</span></br>
          identifier: <input :value="identifier" @input="setIdentifier"><br/>
          authentication: <input type="password" :value="authentication" @input="setAuthentication"><br/>
          <button @click="login()">Login</button>
        </b-col>
      </b-row>
    </b-container>
    <b-container fluid v-if="connectionState===5">
      <b-row>
        <b-col>
          Logging in...
        </b-col>
      </b-row>
    </b-container>
    <b-container fluid v-if="connectionState===6">
      <b-row>
        <b-col>
          Contacts:<br/>
          <li v-for="contact in contacts" @click="setTarget($event, contact)">
            {{ contact }}
          </li>
        </b-col>
        <b-col>
          Chat:<br/>
          Target: <input :value="target" @input="setTargetByValue"><br/>
          Messages:<br/>
          <li v-for="message in targetMessages">
            {{ message }}<br/>
          </li><br/>
          Message Type: <input :value="messageType" @input="setMessageType"><br/>
          Message Content: <input :value="messageContent" @input="setMessageContent"><br/>
          <button @click="sendMessage()">Send Message</button><br/>
        </b-col>
        <b-col>
          Settings:<br/>
        </b-col>
      </b-row>
    </b-container>
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