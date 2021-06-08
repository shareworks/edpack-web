<template>
  <div>
    <page-cover class="mb-30" v-if="!faculty">
      <!-- Download products results -->
      <page-header :title="$t('SW_STATS')"/>

      <el-form>
        <!-- Start & End date -->
        <el-row type="flex" align="middle">
          <el-col :xs="24" :md="4" :sm="8">
            <el-date-picker v-model="minDate" @change="clearCalendar" size="medium" class="auto-width" type="date" format="dd-MM-yyyy" :picker-options="endDateOptions" :placeholder="$t('SW_SELECT_START_DATE')"/>
          </el-col>
          <el-col :xs="24" :md="2" :sm="2" class="">
            <div class="text-muted text-center">
              {{ $t('SW_UNTIL_DATE') }}
            </div>
          </el-col>
          <el-col :xs="24" :md="4" :sm="8">
            <el-date-picker v-model="maxDate" size="medium" class="auto-width" type="date" format="dd-MM-yyyy" :placeholder="$t('SW_SELECT_END_DATE')" :picker-options="endDateOptions"/>
          </el-col>

          <el-col :xs="24" :md="3" :sm="8" class="ml-5">
            <el-button type="primary" size="medium" class="button-square-xs" plain @click="getStatisticsByDate">
              <span>{{ $tc('SW_GET_STATISTIC', 1) }}</span>
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </page-cover>

    <div v-if="status === 'done'" :class="isMobile ? 'px-10' : 'px-20'">
      <el-alert :closable="false" type="warning" v-if="calendarMode" class="mb-20" @close="clearCalendar">
        <p>
          <strong>{{ $t('SW_CALENDAR_MODE', [startEndFormat(minDate), startEndFormat(maxDate, true)]) }}</strong>
          <el-button class="ml-10" type="text" @click="clearCalendar()">
            <i class="icon-clear"></i>
            {{ $t('SW_CLEAR') }}
          </el-button>
        </p>
      </el-alert>

      <!-- completionStats -->
      <masonry v-if="!calendarMode" :cols="{default: 2, 767: 1}" :gutter="{default: '20px', 767: '10px'}">
        <el-card v-for="(stat, index) in statisticCompletionValues" :key="`statisticCompletionValues${index}`" class="stat-counter">
          <animated-circle-bar :realPercentage="Math.round(stat.value)" :width="200" :strokeWidth="30" :fullText="stat.name"/>
        </el-card>
      </masonry>

      <!-- userStats -->
      <masonry v-if="!calendarMode" :cols="{default: 2, 767: 1}" :gutter="{default: '20px', 767: '10px'}">
        <el-card v-for="(stat, index) in statisticUserValues" :key="`statisticUserValues${index}`" class="stat-counter">
          <div class="font-26">
            <i :class="stat.icon"/>
            <strong><countTo :startVal='0' :endVal='stat.value' separator="." :duration='4000'/></strong>
          </div>
          <div>{{ stat.name }}</div>
        </el-card>
      </masonry>

      <!-- calendar stats -->
      <masonry v-if="calendarMode" :cols="{default: 2, 767: 1}" :gutter="{default: '20px', 767: '10px'}">
        <el-card v-for="(stat, index) in calendarStatisticsValues" :key="`calendarStatisticsValues${index}`" class="stat-counter">
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

          <div v-if="calendarMode">{{ stat.calendarText }} {{ stat.name.toLowerCase() }}</div>
          <div v-else>{{ $t('SW_TOTAL') }} {{ stat.name.toLowerCase() }}</div>
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
import moment from 'moment'
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
      calendarMode: false,
      minDate: '',
      maxDate: '',
      isMobile: this.$store.state.isMobile,
      endDateOptions: { disabledDate (time) { return new Date(time) > new Date() } },
      school: this.$store.state.school,
      facultyFilter: this.faculty ? this.faculty._id : this.$route.query.context || '',
      statisticCompletionValues: [],
      statisticUserValues: [],
      statisticStatsValues: [],
      calendarStatisticsValues: [],
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
    clearCalendar (startDateValue) {
      // because date-picker doesn't have clear function we should check on Change that
      // values isn't set, don't want to separate it to another function, so checking it here
      if (startDateValue) return

      this.setupStatisticValues(this.school.counts)
      this.calendarMode = false
      this.minDate = ''
      this.maxDate = ''
    },
    startEndFormat (date, endDate = false) {
      if (!endDate) return moment(date).format('ll')
      else return date ? moment(date).format('ll') : moment(new Date()).format('ll')
    },
    getStatisticsByDate () {
      if (!this.minDate) return this.$message({ message: this.$i18n.t('SW_NO_MIN_DATE'), type: 'warning' })

      this.status = 'loading'
      this.calendarMode = true
      const params = { minDate: this.minDate, maxDate: this.maxDate }

      this.$http.get(`organizations/${this.school._id}/counts`, { params })
        .then(res => { this.setupStatisticValues(res.data.list[0]) })
        .catch(() => { this.status = 'error' })
    },
    getFacultyStatistic () {
      this.status = 'loading'
      this.calendarMode = false

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
      const calendarStatsValues = []

      for (const key in this.statsObject) {
        this.statsObject[key].value = newStatisticValues[key] || 0

        // filter statistic by type
        if (this.statsObject[key].type === 'completionStats') { statCompletionValues.push(this.statsObject[key]) }
        else if (this.statsObject[key].type === 'userStats') { statUserValues.push(this.statsObject[key]) }
        else if (this.statsObject[key].type === 'usersStats') { statStatsValues.push(this.statsObject[key]) }
        else if (this.calendarMode && this.statsObject[key].type === 'calendarStats') { calendarStatsValues.push(this.statsObject[key]) }
      }

      this.statisticCompletionValues = statCompletionValues
      this.statisticUserValues = statUserValues
      this.statisticStatsValues = statStatsValues
      this.calendarStatisticsValues = calendarStatsValues
      this.status = 'done'
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import 'style';
</style>
