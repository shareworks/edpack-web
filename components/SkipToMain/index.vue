<template>
  <!-- Skip to main content -->
  <router-link v-if="!inLTI" :to="link || '/home'" class="skip-to-main-content font-16 bold" tabindex="0">
    {{ $t(text || 'SW_SKIP_TO_MAIN_CONTENT') }}
  </router-link>
</template>

<script>
export default {
  name: 'SkipToMain',
  props: ['link', 'text'],

  data () {
    return {
      inLTI: this.$store.state.inLTI
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
