<template>
  <div>
    <el-progress type="circle" :width="70" :stroke-width="10" :color="customColors" :percentage="percentage"></el-progress>
    <div>{{ $t('SW_' + levelName.toUpperCase()) }} &centerdot; {{resultPerQuestion[index][levelIndex + 1]}}</div>
  </div>
</template>

<script>
export default {
  name: 'AnimatedCircleBar',
  props: ['levelName', 'levelIndex', 'resultPerQuestion', 'realPercentage', 'index'],
  data () {
    return {
      percentage: 0,
      customColors: [
        { color: '#f56c6c', percentage: 20 },
        { color: '#e6a23c', percentage: 40 },
        { color: '#5cb87a', percentage: 60 },
        { color: '#1989fa', percentage: 80 },
        { color: '#6f7ad3', percentage: 100 }
      ]
    }
  },

  mounted () {
    const ANIMATION_DELAY = 600
    setTimeout(() => {
      this.percentage = this.realPercentage
    }, ANIMATION_DELAY)
  }
}
</script>
