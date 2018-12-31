<template>
    <b-container fluid class="p-0">
        <b-row >
            <b-col md="4">
                <CollumnContacts/>
            </b-col>
            <b-col>
                <CollumnEvents/>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import CollumnContacts from './CollumnContacts'
import CollumnEvents from './CollumnEvents'

export default {
  name: 'RouteMain',
  components: {
    CollumnContacts,
    CollumnEvents
  }
}
</script>

<style>
</style>
