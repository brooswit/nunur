<template>
    <b-container>
        <b-row v-if="$store.state.authData.length===0">
            <b-col>
                Simply enter a Username and Password and click "Connect" (Example: your_name@nunur.biz)<br/>
                If the Username doesn't exist, an account will be created for you.<br/>
                (only if domain is nunur.biz or if cross-origin auth is allowed by the domain)<br/>
            </b-col>
        </b-row>
        <b-row v-else>
            <b-col>
                All of your data is stored locally. You can manage your data, or delete it here<br/>
                (Deleting your user is final. There is no way for us to recover it.)<br/>
                <br/>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                USERNAME
            </b-col>
            <b-col>
                PASSWORD
            </b-col>
            <b-col>
                ACTION
            </b-col>
            <b-col>
                STATUS
            </b-col>
            <b-col>
                MANAGE DATA
            </b-col>
            <b-col>
                DELETE
            </b-col>
        </b-row>
        <b-row v-for="(userAuth, username) in $store.state.authData">
            <b-col>
                <template v-if="userAuth.type === 'new' && userAuth.state === 'logged_out' || userAuth.state === 'signUp_or_log_in_failed' || userAuth.state === 'signUp_failed' || userAuth.state === 'log_in_failed'">
                    <b-form-input
                        v-model="username"
                        type="text"
                        placeholder="Username"
                    ></b-form-input>
                </template>
                <template v-else>
                    <b-button disabled variant="outline-primary">
                        {{ username }}
                    </b-button>
                </template>
            </b-col>

            <b-col>
                <template v-if="userAuth.type === 'new' && userAuth.state === 'logged_out' || userAuth.state === 'signUp_or_log_in_failed' || userAuth.state === 'signUp_failed' || userAuth.state === 'log_in_failed'">
                    <b-form-input
                        v-model="userAuth.password"
                        type="password"
                        placeholder="Password"
                    ></b-form-input>
                </template>
                <template v-else>
                    <b-button disabled variant="outline-primary">
                        ****************
                    </b-button>
                </template>
            </b-col>

            <b-col>
                <template v-if="userAuth.type === 'new'">
                    <template v-if="userAuth.state === 'signUping_or_logging_in'">
                        <b-button disabled variant="success">
                            Please wait...
                        </b-button>
                    </template>
                    <template v-else>
                        <b-button variant="success"
                            v-on:click="$store.dispatch('signUpOrLogIn', userAuth)"
                        >
                            <template v-if="userAuth.state === 'logged_out'">
                                signUp/LogIn
                            </template>
                            <template v-else>
                                Try Again
                            </template>
                        </b-button>
                    </template>
                </template>
                <template v-else>
                    <template v-if="userAuth.state === 'unauthenticated'">
                        <b-button variant="success"
                            v-on:click="$store.dispatch('authenticate', userAuth)"
                        >
                            Authenticate
                        </b-button>
                    </template>
                    <template v-else-if="userAuth.state === 'authentication_failed' || userAuth.state === 'logged_out' || userAuth.state === 'log_in_failed'">
                        <b-button variant="success"
                            v-on:click="$store.dispatch('logIn', userAuth)"
                        >
                            <template v-if="userAuth.state !== 'log_in_failed'">
                                LogIn
                            </template>
                            <template v-else>
                                Try Again
                            </template>
                        </b-button>
                    </template>
                    <template v-else-if="userAuth.state === 'unauthenticating' || userAuth.state === 'logging_in' || userAuth.state === 'logging_out'">
                        <b-button disabled variant="success">
                            Please wait...
                        </b-button>
                    </template>
                    <template v-else-if="userAuth.state === 'logged_in' || userAuth.state === 'signedUp'">
                        <b-button variant="success"
                            v-on:click="$store.dispatch('logOut', userAuth)"
                        >
                            Log out
                        </b-button>
                    </template>
                </template>
            </b-col>

            <b-col>
                <template v-if="userAuth.type === 'new'">
                    <b-button disabled variant="outline-secondary">
                        <template v-if="userAuth.state === 'logged_out'">
                            UNsignUpED
                        </template>
                        <template v-else-if="userAuth.state === 'signUping_or_logging_in'">
                            signUpING / LOGGING IN...
                        </template>
                        <template v-else-if="userAuth.state === 'signUp_failed'">
                            USERNAME TAKEN
                        </template>
                        <template v-else-if="userAuth.state === 'log_in_failed'">
                            INCORRECT PASSWORD
                        </template>
                        <template v-else-if="userAuth.state === 'signUp_or_log_in_failed' || userAuth.state === 'signUp_failed' || userAuth.state === 'log_in_failed'">
                            USERNAME TAKEN / INCORRECT PASSWORD
                        </template>
                    </b-button>
                </template>

                <template v-if="userAuth.type === 'signedUp'">
                    <b-button disabled variant="outline-primary">
                        <template v-if="userAuth.state === 'unauthenticated'">
                            UNAUTHENTICATED
                        </template>
                        <template v-else-if="userAuth.state === 'authenticating'">
                            AUTHENTICATING...
                        </template>
                        <template v-else-if="userAuth.state === 'authentication_failed'">
                            AUTHENTICATION EXPIRED
                        </template>
                        <template v-else-if="userAuth.state === 'logged_out'">
                            LOGGED OUT
                        </template>
                        <template v-else-if="userAuth.state === 'logging_in'">
                            LOGGING IN...
                        </template>
                        <template v-else-if="userAuth.state === 'log_in_failed'">
                            INCORRECT PASSWORD
                        </template>
                        <template v-else-if="userAuth.state === 'signedUp'">
                            LOGGED IN
                        </template>
                        <template v-else-if="userAuth.state === 'logged_in'">
                            LOGGED IN
                        </template>
                        <template v-else-if="userAuth.state === 'unauthenticating'">
                            UNAUTHENTICATING...
                        </template>
                        <template v-else-if="userAuth.state === 'logging_out'">
                            LOGGING OUT...
                        </template>
                    </b-button>
                </template>
            </b-col>

            <b-col>
                <b-button variant="outline-danger">
                    Manage Data
                </b-button>
            </b-col>

            <b-col>
                <b-button variant="danger"
                    v-on:click="$store.dispatch('deleteAuthData', username)"
                >
                    Delete
                </b-button>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-form-input
                    v-model="username"
                    type="text"
                    placeholder="Username"
                ></b-form-input>
            </b-col>
            <b-col>
                <b-form-input
                    v-model="password"
                    type="password"
                    placeholder="Password"
                ></b-form-input>
            </b-col>
            <b-col>
                <b-button variant="success"
                    v-on:click="$store.dispatch('addNewUser', username, password); username = password = '';"
                >
                    SignUp / LogIn
                </b-button>
            </b-col>
            <b-col>
                <b-button disabled variant="outline-primary">
                    New User
                </b-button>
            </b-col>
            <b-col/>
            <b-col/>
        </b-row>
    </b-container>
</template>

<script>
export default {
  name: 'RouteManage'
}
</script>

<style>
</style>
