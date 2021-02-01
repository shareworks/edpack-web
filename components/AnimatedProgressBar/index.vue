<template>
  <div>
    <el-progress class="progress-fixed-border" :format="formatText" v-if="isTextVisible" :class="classes" :text-inside="true" :stroke-width="strokeWidth ? strokeWidth : 20" :percentage="percentage" status="success"/>
    <span v-else class="text-muted">{{ $t('SW_NO_DATA') }}</span>
  </div>
</template>

<script>
export default {
  name: 'AnimatedProgressBar',
  props: ['realPercentage', 'isTextVisible', 'strokeWidth', 'classes', 'showText', 'text'],

  data () {
    return {
      percentage: 0
    }
  },

  mounted () {
    const ANIMATION_DELAY = 500
    setTimeout(() => { this.percentage = this.realPercentage }, ANIMATION_DELAY)
  },
  methods: {
    formatText (percentage) {
      return this.showText ? `${percentage}% ${this.$t(this.text)}` : `${percentage}%`
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
