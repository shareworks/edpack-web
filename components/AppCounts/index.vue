<template>
  <div class="about-counters" v-if="counts">
    <masonry :cols="{default: 4, 767: 2}" :gutter="{default: '30px', 767: '20px'}">
      <el-card shadow="never" v-for="(stat, index) in stats" :key="stat.prop" class="text-center">
        <div class="font-20">
          <i :class="stat.icon"></i>
          <strong>
            <countTo ref="counts" :autoplay=false :startVal="((counts[stat.prop] || 0) / 2)" :endVal="(counts[stat.prop] || 0)" separator="." :duration="3000"
                     v-observe-visibility="{callback: (isVisible, entry) => visibilityChanged(isVisible, entry, {visible: true, index}), throttle: countAnimationDelay, once: true}">
            </countTo>
          </strong>
        </div>
        <div class="">{{ stat.name }}</div>
      </el-card>
    </masonry>
  </div>
</template>

<script>
import countTo from 'vue-count-to'

export default {
  name: 'AppCounts',
  components: { countTo },
  data () {
    return {
      counts: false,
      countAnimationDelay: 200,
      stats: [
        { name: this.$i18n.tc('SW_ORGANIZATION', 2), prop: 'organizations', icon: 'icon-school' },
        { name: this.$i18n.t('SW_COURSES'), prop: 'courses', icon: 'icon-graduation' },
        { name: this.$i18n.t('SW_USERS'), prop: 'users', icon: 'icon-user' },
        { name: this.$i18n.t('SW_EVALUATIONS'), prop: 'surveys', icon: 'icon-bar-chart' }
      ]
    }
  },

  mounted () {
    this.getPublicAppCounts()
  },

  methods: {
    visibilityChanged (isVisible, entry, count) {
      const { target } = entry

      if (isVisible) {
        target.classList.remove('invisible')
        target.classList.add('visible')
      } else {
        target.classList.add('invisible')
      }

      if (count && isVisible) {
        setTimeout(() => {
          this.$refs.counts[count.index].start()
        }, this.countAnimationDelay)
      }
    },
    getPublicAppCounts () {
      this.$http.get('public/counts')
        .then((res) => { this.counts = res.data.list[0] })
        .catch((err) => { console.log(err) })
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
