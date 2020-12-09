<template>
  <div>
    <div v-if="status === 'done'">
      <!-- completionStats -->
      <masonry :cols="{default: 2, 767: 1}" :gutter="{default: '20px', 767: '10px'}" v-if="Object.keys(statisticCompletionValues).length">
        <el-card v-for="(stat, key) in statisticCompletionValues" :key="key" class="stat-counter">
          <vc-donut background="white" ba foreground="lightgrey" :size="80" unit="%" :thickness="30" :sections="[{ color: '#67c23a', value: stat.value }]">
            <div class="font-26">
              <strong><countTo :startVal='0' :endVal='stat.value' separator="." :duration='4000'></countTo>%</strong>
            </div>
            <div class="font-14">{{ stat.name }}</div>
          </vc-donut>
        </el-card>
      </masonry>

      <!-- userStats -->
      <masonry :cols="{default: 2, 767: 1}" :gutter="{default: '20px', 767: '10px'}" v-if="Object.keys(userStats).length">
        <el-card v-for="(stat, key) in statisticUserValues" :key="key" class="stat-counter">
          <div class="font-26">
            <i :class="stat.icon"></i>
            <strong><countTo :startVal='0' :endVal='stat.value' separator="." :duration='4000'></countTo></strong>
          </div>
          <div>{{ stat.name }}</div>
        </el-card>
      </masonry>

      <!-- stats -->
      <masonry class="hidden-xs" :cols="{default: 3, 767: 2}" :gutter="{default: '20px', 767: '10px'}" v-if="Object.keys(statisticStatsValues).length">
        <el-card v-for="(stat, key) in statisticStatsValues" :key="key" class="stat-counter">
          <div class="font-20">
            <i :class="stat.icon"></i>
            <strong><countTo :startVal='0' :endVal='stat.value' separator="." :duration='4000'></countTo></strong>
          </div>
          <div>{{ $t('SW_TOTAL') }} {{ stat.name }}</div>
        </el-card>
      </masonry>
    </div>

    <!-- Loading -->
    <spinner v-else-if="status === 'loading'"></spinner>

    <!-- Error -->
    <div v-else-if="status === 'error'" class="mt-30 text-muted text-center">{{ $t('SW_ERROR_LOADING') }}</div>
  </div>
</template>

<script>
import Vue from 'vue'
import countTo from 'vue-count-to'
import Donut from 'vue-css-donut-chart'

Vue.use(Donut)

export default {
  name: 'Statistics',
  props: ['completionStats', 'userStats', 'stats', 'useFaculty'],
  components: { countTo },

  data () {
    return {
      lang: this.$store.state.lang,
      school: this.$store.state.school,
      facultyFilter: this.$route.query.context || '',
      statisticCompletionValues: {},
      statisticUserValues: {},
      statisticStatsValues: {},
      status: 'loading'
    }
  },

  watch: {
    $route () {
      this.facultyFilter = this.$route.query.context
      if (this.useFaculty) this.getFacultyStatistic()
    }
  },

  mounted () {
    if (this.useFaculty) return this.getFacultyStatistic()
    this.checkSchoolCountsAndCallSetup()
  },

  methods: {
    getFacultyStatistic () {
      this.status = 'loading'

      this.$http.get(`organizations/${this.school._id}/faculty/${this.facultyFilter}/counts`)
        .then(res => { this.setupStatisticValues(res.data.list[0]) })
        .catch(() => { this.status = 'error' })
    },
    checkSchoolCountsAndCallSetup () {
      if (this.school.counts) {
        return this.setupStatisticValues(this.school.counts)
      }

      // we will call that function again and again till school.counts won't be ready
      setTimeout(() => { this.checkSchoolCountsAndCallSetup() }, 100)
    },
    setupStatisticValues (newStatisticValues) {
      const statCompletionValues = {}
      const statUserValues = {}
      const statStatsValues = {}

      // add specific value to values object
      this.completionStats.forEach(statProperty => {
        statCompletionValues[statProperty.prop] = { ...statProperty, value: 0 }
      })
      this.userStats.forEach(statProperty => {
        statUserValues[statProperty.prop] = { ...statProperty, value: 0 }
      })
      this.stats.forEach(statProperty => {
        statStatsValues[statProperty.prop] = { ...statProperty, value: 0 }
      })

      // add values from api to values object
      for (const statProp in statCompletionValues) {
        if (newStatisticValues[statProp]) {
          statCompletionValues[statProp].value = newStatisticValues[statProp]
        }
      }
      for (const statProp in statUserValues) {
        if (newStatisticValues[statProp]) {
          statUserValues[statProp].value = newStatisticValues[statProp]
        }
      }
      for (const statProp in statStatsValues) {
        if (newStatisticValues[statProp]) {
          statStatsValues[statProp].value = newStatisticValues[statProp]
        }
      }

      this.statisticCompletionValues = statCompletionValues
      this.statisticUserValues = statUserValues
      this.statisticStatsValues = statStatsValues
      this.status = 'done'
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import 'style';
</style>
