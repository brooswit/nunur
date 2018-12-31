<template>
    <b-container fluid class="p-0">
        <b-row >
            <b-col>
                <template v-if="!$store.state.isInitialized">
                    Initializing...
                </template>
                <template v-else>
                    <slot></slot>
                </template>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
export default {
  name: 'WrapperIsInitialized'
}
</script>

<style>

</style>
