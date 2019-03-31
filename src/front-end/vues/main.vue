<template>
  Hello {{world}}
</template>

<script>
import Vue from "vue";
export default Vue.extend({
  data() {
    return {
      world: "World"
    };
  }
});
</script>

<style scoped>
.container {
  color: green;
}
</style>