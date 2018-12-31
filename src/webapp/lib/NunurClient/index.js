import "babel-polyfill";

import EventEmitterX from '../EventEmitterX';

export default class NunurClient {
    constructor() {
        this._state = null;
        this._ws = null;
        this._events = null;
        this._userStates = null;
        this.reset()
    }

    async reset() {
        this._state = 'uninitialized';
        this._ws = null;
        this._events = new EventEmitter();
        this._userStates = {};
    }

    async initialize() {
        if (!this._isState('uninitialized')) {
            console.log('allready initialized');
            return false;
        }

        this._setState('initializing');

        this.ws = new WebSocket( 'ws://127.0.0.1:8080' );
        this.ws.onmessage = (event) => {
            console.log('message', event.data);
            this.emit('message', event);
            let parsedData = JSON.parse(event.data);
            console.log(parsedData);
            if ([
                'signedUp', 'signUp-failed',
                'loggedIn', 'logIn-failed', 'loggedOut'
            ].indexOf(parsedData.op) !== -1) {
                this._setState(parsedData.data.username, parsedData.op);
            } else if (parsedData.op === 'event') {
                this.emit('event', parsedData.data);
            }
        };

        return await new Promise( (resolve, reject) => {
            this.ws.onopen = () => {
                for (let username in this._userStates) {
                    this._setState(username, 'initialized');
                }
                this._setState('initialized');
                resolve(true);
            };
            this.ws.onerror = () => {
                console.log.apply(undefined, ['WSERROR'].concat(arguments));
                this.ws.onclose();
            }
            this.ws.onclose = () => {
                console.log('CLOSED');
                for (let username in this._userStates) {
                    this._setState(username, 'uninitialized');
                }
                this._reset('initialized');
                this._setState('uninitialized');
                resolve(false);
            };
        });
    }

    _setState(usernameOrStateName, stateNameOrUndefined) {
        let username = stateNameOrUndefined ? usernameOrStateName : undefined;
        let stateName = stateNameOrUndefined ? stateNameOrUndefined : usernameOrStateName;
        console.log('new state', {username, stateName});
        if (username) {
            this._userStates[username] = stateName;
            this.emit(stateName, username);
        } else {
            this._state = stateName;
            this.emit(stateName);
        }
    }

    _isState(usernameOrStateName, stateNameOrUndefined) {
        let username = stateNameOrUndefined ? usernameOrStateName : undefined;
        let stateName = stateNameOrUndefined ? stateNameOrUndefined : usernameOrStateName;

        if (username) {
            return this._userStates[username] === stateName;
        } else {
            return this._state === stateName;
        }
    }

    getState(username) {
        if (username) {
            return this._userStates[username];
        } else {
            return this._state;
        }
    }

    async on(eventName, callback) {
        return await this._events.on.apply(this._events, arguments);
    }

    async once(eventName, callback) {
        return await this._events.once.apply(this._events, arguments);
    }

    async when(eventName, callback) {
        return await this._events.when.apply(this._events, arguments);
    }

    async _reset(eventName, callback) {
        return await this._events.reset.apply(this._events, arguments);
    }

    async emit(eventName) {
        return await this._events.emit.apply(this._events, arguments);
    }

    async off(eventName) {
        return await this._events.off.apply(this._events, arguments);
    }

    async send(op, data) {
        this._ws.send(JSON.stringify({op, data}));
        return true;
    }

    async signUp({username, password}) {
        if (!this._isState('initialized')) {
            return false;
        }
        await this._setState(username, 'signingUp');
        await this.send('signUp', {username, password});
        return true;
    }

    async logIn({username, password, token}) {
        if (!this._isState('initialized')) {
            return false;
        }
        await this._setState(username, 'loggingIn');
        await this.send('logIn', {username, password, token});
        return true;
    }

    async logOut({username}) {
        if (!this._isState('initialized')) {
            return false;
        }
        await this._setState(username, 'loggingOut');
        await this.send('logOut', {username});
        return true;
    }

    async close() {
        if (!this._isState('initialized')) {
            return false;
        }
        await this._setState('closing');
        await this.send('close');
        return true;
    }

    isInitialized() {
        return this._isState('initialized');
    }
}