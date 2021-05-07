<template>
  <div>
    <div v-if="status === 'done'">
      <el-form class="mb-10">
        <!-- Start & End date -->
        <el-form-item :label="$t('SW_STARTEND_DATE')">
          <el-row type="flex" justify="center" align="middle">
            <el-col :xs="24" :sm="8">
              <el-date-picker v-model="minDate" class="auto-width" type="date" format="dd-MM-yyyy" :picker-options="endDateOptions" :placeholder="$t('SW_SELECT_DATE')"/>
            </el-col>
            <el-col :xs="24" :sm="4" class="hidden-xs">
              <div class="text-muted text-center">
                {{ $t('SW_UNTIL_DATE') }}
              </div>
            </el-col>
            <el-col :xs="24" :sm="8">
              <el-date-picker v-model="maxDate" class="auto-width" type="date" format="dd-MM-yyyy" :placeholder="$t('SW_SELECT_DATE')" :picker-options="endDateOptions"/>
            </el-col>

            <el-col :xs="24" :sm="4" class="hidden-xs ml-5">
              <el-button type="primary" size="medium" class="button-square-xs" plain @click="getStatisticsByDate" :disabled="!minDate && !maxDate">
                <span class="hidden-xs hidden-sm">{{ $tc('SW_GET_STATISTIC', 1) }}</span>
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>

      <!-- completionStats -->
      <masonry :cols="{default: 2, 767: 1}" :gutter="{default: '20px', 767: '10px'}">
        <el-card v-for="(stat, index) in statisticCompletionValues" :key="`statisticCompletionValues${index}`" class="stat-counter">
          <animated-circle-bar :realPercentage="Math.round(stat.value)" :width="200" :strokeWidth="30" :fullText="stat.name"/>
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
    statsObject: Object
  },
  components: { countTo, AnimatedCircleBar },

  data () {
    return {
      minDate: '',
      maxDate: '',
      endDateOptions: { disabledDate (time) { return new Date(time) > new Date() } },
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
    getStatisticsByDate () {
      this.status = 'loading'
      const params = { minDate: this.minDate, maxDate: this.maxDate }

      this.$http.get(`organizations/${this.school._id}/counts`, { params })
        .then(res => { this.setupStatisticValues(res.data.list[0]) })
        .catch(() => { this.status = 'error' })
    },
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
      // prepare containers for statistic
      const statCompletionValues = []
      const statUserValues = []
      const statStatsValues = []

      for (const key in this.statsObject) {
        this.statsObject[key].value = newStatisticValues[key] || 0

        // filter statistic by type
        if (this.statsObject[key].type === 'completionStats') { statCompletionValues.push(this.statsObject[key]) }
        else if (this.statsObject[key].type === 'userStats') { statUserValues.push(this.statsObject[key]) }
        else if (this.statsObject[key].type === 'usersStats') { statStatsValues.push(this.statsObject[key]) }
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
