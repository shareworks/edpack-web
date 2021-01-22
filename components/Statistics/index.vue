<template>
  <div>
    <div v-if="status === 'done'">
      <!-- completionStats -->
      <masonry :cols="{default: 2, 767: 1}" :gutter="{default: '20px', 767: '10px'}">
        <el-card v-for="(stat, index) in statisticCompletionValues" :key="`statisticCompletionValues${index}`" class="stat-counter">
          <AnimatedCircleBar :realPercentage="Math.round(stat.value)" :width="200" :strokeWidth="30" :fullText="stat.name"/>
        </el-card>
      </masonry>

      <!-- userStats -->
      <masonry :cols="{default: 2, 767: 1}" :gutter="{default: '20px', 767: '10px'}">
        <el-card v-for="(stat, index) in statisticUserValues" :key="`statisticUserValues${index}`" class="stat-counter">
          <div class="font-26">
            <i :class="stat.icon"/>
            <strong><countTo :startVal='0' :endVal='stat.value' separator="." :duration='4000'/></strong>
          </div>
          <div>{{ stat.name }}</div>
        </el-card>
      </masonry>

      <!-- stats -->
      <masonry class="hidden-xs" :cols="{default: 3, 767: 2}" :gutter="{default: '20px', 767: '10px'}">
        <el-card v-for="(stat, index) in statisticStatsValues" :key="`statisticStatsValues${index}`" class="stat-counter">
          <div class="font-20">
            <i :class="stat.icon"/>
            <strong><countTo :startVal='0' :endVal='stat.value' separator="." :duration='4000'/></strong>
          </div>
          <div>{{ $t('SW_TOTAL') }} {{ stat.name }}</div>
        </el-card>
      </masonry>
    </div>

    <!-- Loading -->
    <spinner v-else-if="status === 'loading'"/>

    <!-- Error -->
    <div v-else-if="status === 'error'" class="mt-30 text-muted text-center">{{ $t('SW_ERROR_LOADING') }}</div>
  </div>
</template>

<script>
import countTo from 'vue-count-to'
import AnimatedCircleBar from '@/edpack-web/components/AnimatedCircleBar'

export default {
  name: 'Statistics',
  props: {
    faculty: { default: false },
    stats: Array
  },
  components: { countTo, AnimatedCircleBar },

  data () {
    return {
      school: this.$store.state.school,
      facultyFilter: this.faculty ? this.faculty._id : this.$route.query.context || '',
      statisticCompletionValues: [],
      statisticUserValues: [],
      statisticStatsValues: [],
      status: 'loading'
    }
  },

  watch: {
    $route () {
      this.facultyFilter = this.$route.query.context
      if (this.faculty) this.getFacultyStatistic()
    }
  },

  mounted () {
    if (this.faculty) return this.getFacultyStatistic()
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
      const wholeValues = {}

      // prepare containers for statistic
      const statCompletionValues = []
      const statUserValues = []
      const statStatsValues = []

      // use just statistics from the stats list
      this.stats.forEach(statProperty => {
        wholeValues[statProperty.prop] = { ...statProperty, value: newStatisticValues[statProperty.prop] || 0 }
      })

      for (const statProp in wholeValues) {
        // filter statistic by type
        if (wholeValues[statProp].type === 'completionStats') { statCompletionValues.push(wholeValues[statProp]) }
        if (wholeValues[statProp].type === 'userStats') { statUserValues.push(wholeValues[statProp]) }
        if (wholeValues[statProp].type === 'usersStats') { statStatsValues.push(wholeValues[statProp]) }
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
