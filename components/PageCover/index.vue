<template>
  <div class="page-cover">
    <div class="cover-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageCover'
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
