<template>
  <transition mode="out-in" :leave-active-class="toLeft ? 'to-right' : 'to-left'" :enter-active-class="toLeft ? 'from-left' : 'from-right'">
    <!-- Children -->
    <slot/>
  </transition>
</template>

<script>
export default {
  name: 'AnimatedTabs',
  props: ['toLeft']
}
</script>

<style lang="scss">
@import '~scss_vars';
@import 'style';
</style>
