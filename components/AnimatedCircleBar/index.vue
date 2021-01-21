<template>
  <div>
    <el-progress type="circle" :width="width ? width : 70" :stroke-width="strokeWidth ? strokeWidth : 10" :color="customColors" :percentage="percentage"/>
    <div v-if="fullText">{{ fullText }}</div>

    <div>
      <span v-if="levelName">{{ $t('SW_' + levelName.toUpperCase()) }} &centerdot; </span>
      <span v-if="resultPerQuestion">{{resultPerQuestion[index][levelIndex + 1]}}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnimatedCircleBar',
  props: ['levelName', 'levelIndex', 'resultPerQuestion', 'realPercentage', 'index', 'width', 'strokeWidth', 'fullText'],
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
    setTimeout(() => { this.percentage = this.realPercentage }, ANIMATION_DELAY)
  }
}
</script>
