import Vuex from 'vuex';
// import NunurClient from './lib/NunurClient';
// import shortId from 'shortId';

var shortId = {};
var NunurClient = function(){};
const defaultUser = {
    name: 'anonymous',
    profilePicUrl: '',
    userName: null,
    displayName: null,
};

const nunurClient = new NunurClient();

const state = {
    // interface controlled
    currentUsername: 'anonymous',

    // route controlled
    targetUsername: null,

    // nunur client controlled
    isInitialized: false,
    authenticatedUsernames: [],

    // internally used
    userData: {},
    eventData: [],
    statusMessages: [],
    authData: {}
};

const mutations = {
    newAuth(state) {
        authData.push({
            id: shortId.generate(),
            type: 'new',
            state: 'logged_out'
        });
    },
    updateIsInitialized(state) {
        state.isInitialized = nunurClient.isInitialized();
    },
    updateAuthenticatedUsernames(state) {
        state.authenticatedUsernames = nunurClient.getAuthenticatedUsernames();
    },
    pushEvent(state, {sourceAddress, targetAddresses, eventType, eventPayload}) {
        let event = {sourceAddress, targetAddresses, eventType, eventPayload};
        let userAddresses = Array.concat([sourceAddress], targetAddresses);
        
        for (let userAddress in targeuserAddressestAddresses) {
            state.userData[userAddress]        = state.userData[userAddress]        || {};
            state.userData[userAddress].events = state.userData[userAddress].events || [];

            state.userData[userAddress].events.push(event);
        }

        state.eventData.push(event);
        window.localStorage.setItem('eventData', JSON.stringify(state.eventData));
    },
    pushStatus(state, {message}) {
        state.statusMessages.push(message);
    },
    addConfig(state, config) {
        state.authData.push(config);
    },
    updateUser(state, user) {
        if (typeof user === 'string') {
            user = {username: user}
        }
        state.userData[user.username] = state.userData[user.username] || Object.assign({}, user, defaultUser);
    }
};

const getters = {
    allAuthData(state, getters) {
        return state.authData.concat([state.newAuth]);
    },
    currentStatus(state, getters) {
        return state.statusMessages[state.statusMessages.length-1];
    },
    currentUserView(state, getters) {
        return getters.authenticatedUsers[state.currentUsername] || Object.assign(
            {invalid: true},
            defaultUser
        );
    },
    authenticatedUsers(state, getters) {
        let authenticatedUsers = {}
        for (let authenticatedUsername in state.authenticatedUsernames) {
            authenticatedUsers[authenticatedUsername] = state.userData[authenticatedUsername];
        }
        return authenticatedUsers;
    },
    isAuthenticated(state, getters) {
        return state.authenticatedUsernames.length > 0;
    }
};

const actions = {
    initialize: async function ({getters, dispatch, commit}) {
        await nunurClient.close();
        await nunurClient.reset();

        let initializedOps = [
            'initialized', 'uninitialized'
        ];
        for (let initializedOpIndex in initializedOps) {
            let initializedOp = initializedOps[initializedOpIndex];
            console.log(initializedOp + initializedOp);
            nunurClient.on(initializedOp, () => {
                commit('updateIsInitialized');
            });
        }
        let authenticatedOps = [
            'signedUp', 'loggedIn', 'loggedOut',
            'signUp-failed', 'logIn-failed'
        ];
        for (let authenticatedOpIndex in authenticatedOps) {
            let authenticatedOp = authenticatedOps[authenticatedOpIndex];
            nunurClient.on(authenticatedOp, (username) => {
                commit('updateAuthenticated', username);
            });
        }

        nunurClient.on('event', (data) => {
            dispatch('processEvent', event, data);
        });

        await nunurClient.initialize();
    },
    addNewUser: async function({dispatch, state}, username, password) {
        let newAuthData = state.authData[username] = { username, password };
        dispatch('signUpOrLogIn', newAuthData);
    },
    deleteAuthData: async function({state}, authDataIndex) {
        state.authData.splice(authDataIndex, 1);
    },
    signUpOrLogIn: async function({state, dispatch, commit}, userAuth) {
        userAuth.state = 'signUping_or_logging_in';

        if (!await dispatch('signUp', userAuth) && !await dispatch('logIn', userAuth)) {
            userAuth.state = "signUp_or_log_in_failed";
            return false;
        }

        userAuth.type = "signedUp";

        return true;
    },
    signUp: async function({dispatch}, userAuth) {
        let {username, password} = userAuth;
        await dispatch('log', `signUping ${username}`);
        return await nunurClient.signUp({username, password});
        userAuth.state = success ? "signedUp" : "signUp_failed";
        return success;
    },
    logIn: async function({dispatch}, userAuth) {
        let {username, password} = userAuth;
        await dispatch('log', `logging in ${username}`);
        return await nunurClient.logIn({username, password});
        userAuth.state = success ? "logged_in" : "log_in_failed";
        return success;
    },
    authenticate: async function({dispatch}, userAuth) {
        let {username, token} = userAuth;
        await dispatch('log', `authenticating ${username}`);
        return await nunurClient.authenticate({username, token});
        userAuth.state = success ? "authenticated" : "authenticate_failed";
        return success;
    },
    unathenticate: async function({dispatch}, userAuth) {
        let {username} = userAuth;
        await dispatch('log', `unauthenticating ${username}`);
        var success = await nunurClient.unathenticate({username});
        if (success) {
            userAuth.state = "unauthenticated"
        }
        return success;
    },
    logOut: async function ({dispatch}, userAuth) {
        let {username} = userAuth;
        await dispatch('log', `logging out ${username}`);
        var success = await nunurClient.logOut({username});
        if (success) {
            userAuth.state = "logged_out"
        }
        return success;
    },
    sendEvent: async function({dispatch}, {username, targetAddress, targetAddresses, eventType, eventPayload}) {
        targetAddresses = targetAddresses || [targetAddress];
        let hasTarget = targetAddresses.length > 0;
        let singleTarget = targetAddresses.length === 1;
        let manyTargets = targetAddresses.length > 1;
        let message = [
            `sending ${eventType} event from ${username}`,
            `${hasTarget && ' to '}`,
            `${singleTarget && targetAddresses[0]}`,
            `${manyTargets && targetAddresses.length + ' users'}`
        ].join();
        await dispatch('log', message);
        await nunurClient.sendEvent({username, targetAddresses, eventType, eventPayload});
    },
    configure: async function({dispatch}, {username, configuration}) {
        await dispatch('log', `updating session configuration for ${username}`);
        await nunurClient.configure({username, configuration});
    },
    chat: async function({dispatch}, {username, targetAddress, message}) {
        await dispatch('log', `sending chat from ${username} to ${targetAddress}`);
        await dispatch('sendEvent', {
            username, targetAddress,
            eventType: 'chat',
            eventPayload: {message}
        });
    },
    identify: async function({dispatch, getters}, {username, attributes}) {
        await dispatch('log', `updating identity for ${username}`);
        await dispatch('sendEvent', {
            username,
            targetAddresses: getters.authenticatedUsers[username].friendsAddresses,
            eventType: 'identity',
            eventPayload: attributes
        });
    },
    memo: async function({dispatch, getters}, {username, attributes}) {
        await dispatch('log', `updating memo for ${username}`);
        await dispatch('processEvent', {
            sourceAddress: username,
            targetAddresses: [],
            eventType: 'memo',
            eventPayload: attributes
        });
    },
    processEvent: async function({dispatch, getters, commit}, {sourceAddress, targetAddress, targetAddresses, eventType, eventPayload}) {
        targetAddresses = targetAddresses.slice() || [targetAddress];
        eventPayload = Object.assign({}, eventPayload);

        let hasTarget = targetAddresses.length > 0;
        let singleTarget = targetAddresses.length === 1;
        let manyTargets = targetAddresses.length > 1;
    
        let message = [
            `processing ${eventType} event from ${username}`,
            // "processing EVENTTYPE event from USERNAME"
            `${hasTarget && ' to '}`,
            // "processing EVENTTYPE event from USERNAME to USERNAME"
            `${singleTarget && targetAddresses[0]}`,
            // "processing EVENTTYPE event from USERNAME to X users"
            `${manyTargets && targetAddresses.length + ' users'}`
        ].join();
        await dispatch('log', message);

        if(!getters.isValidAddress(sourceAddress)) {
            await dispatch('log', `failed to process event. Address "${sourceAddress}" is invalid`);
            return false;
        }

        let invalidAddressses = getters.onlyInvalidAddresses(targetAddresses);
        if(invalidAddressses.length > 0) {
            await dispatch('log', `failed to process event. "${JSON.stringify(invalidAddressses)}" are invalid`);
            return false;
        }

        if (eventType === 'identity' || eventType === 'memo') {
            commit('updateUser', eventPayload);
        } else {
            commit('updateUser', username);
        }

        for (targetAddress in targetAddresses) {
            commit('updateUser', targetAddress);
        }

        let event = {sourceAddress, targetAddresses, eventType, eventPayload};
        commit('pushEvent', event);
        commit('pushUserEvents', {event});
    },
    processEvents: async function({dispatch}, events) {
        for (event in events) {
            await dispatch('processEvent', event);
        }
    },
    log: async function({commit}, message) {
        console.log('nunur:', message);
        await commit('pushStatus', {message});
    }
};

export default store = new Vuex.Store({
    state,
    mutations,
    getters,
    actions
});
