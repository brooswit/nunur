<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand>NUNUR</b-navbar-brand>
    </b-navbar>
    <b-container fluid v-if="connectionState<=1">
      <b-row no-gutters>
        <b-col> 
          Disconnected...
        </b-col>
      </b-row>
    </b-container>
    <b-container fluid v-if="connectionState===2">
      <b-row no-gutters>
        <b-col>
          Connecting...
        </b-col>
      </b-row>
    </b-container>
    <b-container fluid v-if="connectionState===3 || connectionState===4">
      <b-row no-gutters>
        <b-col>
          <span v-if="connectionState===4">Logged out</span></br>
          identifier: <input :value="identifier" @input="setIdentifier"><br/>
          authentication: <input type="password" :value="authentication" @input="setAuthentication"><br/>
          <b-button @click="login()">Login</b-button>
        </b-col>
      </b-row>
    </b-container>
    <b-container fluid v-if="connectionState===5">
      <b-row no-gutters>
        <b-col>
          Logging in...
        </b-col>
      </b-row>
    </b-container>
    <b-container fluid v-if="connectionState===6">
      <b-row no-gutters>
        <b-col cols="2">
          <b-container fluid>
            <b-row no-gutters>
              <b-col>
                <li v-for="contact in contacts" @click="setTarget($event, contact)">
                  {{ contact }}
                </li>
              </b-col>
            </b-row>
          </b-container>
        </b-col>
        <b-col>
          <b-container fluid>
            <b-row no-gutters>
              <b-col>
                <label>Target:</label>
                <b-form-input v-model="target"></b-form-input>
              </b-col>
            </b-row>
            <b-row no-gutters>
              <b-col>
                <b-form-input v-model="messageContent"></b-form-input>
              </b-col>
            </b-row>
            <b-row no-gutters>
              <b-col>
                <b-form-select v-model="messageType" :options="['chat','mood']"></b-form-select>
              </b-col>
              <b-col>
                <b-button @click="sendMessage()">Send</b-button>
              </b-col>
            </b-row>
            <b-row no-gutters v-for="message in targetMessages">
              <b-col>
                {{ message.sender }} ({{message.type}}): {{ message.content }}
              </b-col>
            </b-row>
          </b-container>
        </b-col>
        <!-- <b-col cols="3">
          <b-container fluid>
            <b-row no-gutters>
              <b-col>
                Contact settings:<br/>
              </b-col>
            </b-row>
            <b-row no-gutters>
              <b-col>
                NUNUR settings:
              </b-col>
            </b-row>
            <b-row no-gutters>
              <b-col>
                Your remote data: {{ remoteData }}
              </b-col>
            </b-row>
            <b-row no-gutters>
              <b-col>
                Your local data: {{ localData }}
              </b-col>
            </b-row>
          </b-container>
        </b-col> -->
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
      ]),
      ...mapGetters([
        'contacts',
        'targetMessages',
      ]),
      target: {
        set(target) {
          this.$store.commit("SET_TARGET", {target})
        },
        get() {
          return this.$store.state.target
        }
      },
      messageType: {
        set(messageType) {
          this.$store.commit("SET_MESSAGE_TYPE", {messageType})
        },
        get() {
          return this.$store.state.messageType
        }
      },
      messageContent: {
        set(messageContent) {
          this.$store.commit("SET_MESSAGE_CONTENT", {messageContent})
        },
        get() {
          return this.$store.state.messageContent
        }
      },
  },
    data() {
      return {
        // target: '',
        // messageContent: '',
        // mesaageType: "chat",
      }
    },
    methods: {
      setIdentifier(event) { this.$store.dispatch('setIdentifier', {identifier: event.target.value}) },
      setAuthentication(event) { this.$store.dispatch('setAuthentication', {authentication: event.target.value}) },
      login(event) { this.$store.dispatch('login') },
      setTargetByValue(event) { this.$store.dispatch('setTarget', { target: event.target.value }) },
      setTarget(event, target) { this.$store.dispatch('setTarget', { target }) },
      setMessageTypeByValue(value) { this.$store.dispatch('setMessageType', { messageType: value }) },
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