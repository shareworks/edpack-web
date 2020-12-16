<template>
  <div class="about-counters" v-if="counts">
    <masonry :cols="{default: 4, 767: 2}" :gutter="{default: '30px', 767: '20px'}">
      <el-card shadow="never" v-for="(stat, index) in stats" :key="stat.prop" class="text-center">
        <div class="font-20">
          <i :class="stat.icon"></i>
          <strong>
            <!-- Count component -->
            <countTo ref="counts" :autoplay=false :startVal="((counts[stat.prop] || 0) / 2)" :endVal="(counts[stat.prop] || 0)" separator="." :duration="3000"
                     v-observe-visibility="{callback: (isVisible, entry) => visibilityChanged(isVisible, entry, {visible: true, index}), throttle: countAnimationDelay, once: true}">
            </countTo>
          </strong>
        </div>
        <div>{{ $tc(stat.name, 2) }}</div>
      </el-card>
    </masonry>
  </div>
</template>

<script>
import countTo from 'vue-count-to'
import basicVisibilityChanged from '@/edpack-web/utils/basic-visibility-changed'

export default {
  name: 'AppCounts',
  props: ['stats'],
  components: { countTo },
  data () {
    return {
      counts: false,
      countAnimationDelay: 200
    }
  },

  mounted () {
    this.getPublicAppCounts()
  },

  methods: {
    startCountAnimation (count, isVisible) {
      if (count && isVisible) {
        setTimeout(() => {
          this.$refs.counts[count.index].start()
        }, this.countAnimationDelay)
      }
    },

    visibilityChanged (isVisible, entry, count) {
      basicVisibilityChanged(isVisible, entry, 'invisible', 'visible', this.startCountAnimation, count, isVisible)
    },

    getPublicAppCounts () {
      this.$http.get('public/counts')
        .then((res) => { this.counts = res.data })
        .catch((err) => { console.log(err) })
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
