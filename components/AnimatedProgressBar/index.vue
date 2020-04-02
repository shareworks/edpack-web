<template>
  <div>
    <el-progress v-if="isTextVisible" :text-inside="true" :stroke-width="20" :percentage="percentage" status="success"></el-progress>
    <span v-else class="text-muted">{{ $t('SW_NO_DATA') }}</span>
  </div>
</template>

<script>
export default {
  name: 'AnimatedProgressBar',
  props: ['realPercentage', 'isTextVisible'],

  data () {
    return {
      percentage: 0
    }
  },

  mounted () {
    const ANIMATION_DELAY = 500
    setTimeout(() => {
      this.percentage = this.realPercentage
    }, ANIMATION_DELAY)
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
