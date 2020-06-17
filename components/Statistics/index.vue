<template>
  <div>
    <masonry :cols="{default: 2, 767: 1}" :gutter="{default: '20px', 767: '10px'}" v-if="completionStats">
      <el-card v-for="stat in completionStats" :key="stat.prop" class="stat-counter">

        <vc-donut background="white" foreground="lightgrey" :size="80" unit="%" :thickness="30" :sections="stat.sections">
          <div class="font-26">
            <strong><countTo :startVal='(school.counts[stat.prop] / 2)' :endVal='school.counts[stat.prop]' separator="." :duration='4000'></countTo>%</strong>
          </div>
          <div class="font-14">{{ stat.name }}</div>
        </vc-donut>
      </el-card>
    </masonry>

    <masonry :cols="{default: 2, 767: 1}" :gutter="{default: '20px', 767: '10px'}" v-if="userStats">
      <el-card v-for="stat in userStats" :key="stat.prop" class="stat-counter">
      <div class="font-26">
        <i :class="stat.icon"></i>
        <strong><countTo :startVal='(school.counts[stat.prop] / 2)' :endVal='school.counts[stat.prop]' separator="." :duration='4000'></countTo></strong>
      </div>
      <div>{{ stat.name }}</div>
    </el-card>
    </masonry>

    <masonry class="hidden-xs" :cols="{default: 3, 767: 2}" :gutter="{default: '20px', 767: '10px'}" v-if="stats">
      <el-card v-for="stat in stats" :key="stat.prop" class="stat-counter">
        <div class="font-20">
          <i :class="stat.icon"></i>
          <strong><countTo :startVal='(school.counts[stat.prop] / 2)' :endVal='school.counts[stat.prop]' separator="." :duration='4000'></countTo></strong>
        </div>
        <div>{{ $t('SW_TOTAL') }} {{ stat.name }}</div>
      </el-card>
    </masonry>
  </div>
</template>

<script>
import Vue from 'vue'
import countTo from 'vue-count-to'
import Donut from 'vue-css-donut-chart'

Vue.use(Donut)

export default {
  name: 'Statistics',
  props: ['closeDialog', 'completionStats', 'userStats', 'stats'],
  components: { countTo },

  data () {
    return {
      school: this.$store.state.school,
      lang: this.$store.state.lang
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import 'style';
</style>
