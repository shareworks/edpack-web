<template>
  <div>
    <page-cover class="mb-30" v-if="!faculty">
      <!-- Download products results -->
      <page-header :title="$t('SW_STATS')"/>

      <el-form>
        <!-- Start & End date -->
        <el-row>
          <el-col :lg="12" :md="24" :xs="24">
            <div class="flex">
              <!--  Date picker  -->
              <el-date-picker v-model="selectedDate" class="w-100 mr-10" @change="clearCalendar" size="medium" type="daterange" format="dd-MM-yyyy" :picker-options="endDateOptions" :placeholder="$t('SW_SELECT_START_DATE')"/>
              <el-button type="primary" size="medium" class="button-square-xs" plain @click="getStatisticsByDate">
                <span>{{ $tc('SW_GET_STATISTIC', 1) }}</span>
              </el-button>
            </div>
          </el-col>
        </el-row>
        <!-- Animated tabs -->
        <el-row>
          <el-col :lg="12" :md="24" :xs="24">
            <!-- Tabs -->
            <el-tabs v-model="toTab" @tab-click="tabClick" class="mt-10">
              <el-tab-pane v-for="tab in tabs" :key="tab.name" :label="$t(tab.label)" :name="tab.name"/>
            </el-tabs>
          </el-col>
        </el-row>
      </el-form>
    </page-cover>

    <animated-tabs v-if="status === 'done'" :to-left="toLeftDirection" :class="isMobile ? 'px-10' : 'px-20'">
      <template v-slot>
        <statistics-ackee v-if="toTab === 'views'" :appStatistics="appStatistics" :statisticsMode="'views'" :minDate="minDate" :maxDate="maxDate" :key="`statistics-ackee-${statisticsTick}`"/>

        <div v-else-if="toTab === 'usage'">
          <el-alert :closable="false" type="warning" v-if="calendarMode" class="mb-20" @close="clearCalendar">
            <p>
              <strong>{{ $t('SW_CALENDAR_MODE', [startEndFormat(minDate), startEndFormat(maxDate, true)]) }}</strong>
              <el-button class="ml-10" type="text" @click="clearCalendar()">
                <i class="icon-clear"/>
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

        <statistics-ackee v-else-if="toTab === 'details'" :appStatistics="appStatistics" :statisticsMode="'details'" :minDate="minDate" :maxDate="maxDate" :key="`statistics-ackee-${statisticsTick}`"/>
      </template>
    </animated-tabs>

    <!-- Loading -->
    <spinner v-else-if="status === 'loading'"/>

    <!-- Error -->
    <div v-else-if="status === 'error'" class="mt-30 text-muted text-center">{{ $t('SW_ERROR_LOADING') }}</div>
  </div>
</template>

<script>
import moment from 'moment'
import countTo from 'vue-count-to'
import AnimatedTabs from '@/edpack-web/components/AnimatedTabs'
import StatisticsAckee from '@/edpack-web/components/StatisticsAckee'
import AnimatedCircleBar from '@/edpack-web/components/AnimatedCircleBar'

export default {
  name: 'Statistics',
  props: {
    faculty: { default: false },
    statsObject: Object,
    appStatistics: Boolean
  },
  components: { countTo, AnimatedCircleBar, StatisticsAckee, AnimatedTabs },

  data () {
    return {
      toTab: 'usage',
      lastToTab: 'usage',
      tabs: [
        { name: 'usage', label: 'SW_USAGE' },
        { name: 'views', label: 'SW_VIEWS' },
        { name: 'details', label: 'SW_DETAILS' }
      ],
      toLeftDirection: false,
      calendarMode: false,
      minDate: '',
      maxDate: '',
      selectedDate: '',
      isMobile: this.$store.state.isMobile,
      endDateOptions: { disabledDate (time) { return new Date(time) > new Date() } },
      school: this.$store.state.school,
      facultyFilter: this.faculty ? this.faculty._id : this.$route.query.context || '',
      statisticCompletionValues: [],
      statisticUserValues: [],
      statisticStatsValues: [],
      calendarStatisticsValues: [],
      status: 'loading',
      statisticsTick: 0
    }
  },

  watch: {
    $route () {
      this.facultyFilter = this.$route.query.context
      if (this.faculty) this.getFacultyStatistic()
    }
  },

  mounted () {
    if (this.appStatistics) return this.status = 'done'
    else if (this.faculty) return this.getFacultyStatistic()
    this.checkSchoolCountsAndCallSetup()
  },

  methods: {
    tabClick ({ name }) {
      if (this.lastToTab === name) return

      // initial value
      let fromTabIndex = null
      let toTabIndex = null

      this.tabs.forEach((tab, index) => {
        if (tab.name === this.lastToTab) fromTabIndex = index
        if (tab.name === this.toTab) toTabIndex = index
      })

      // calculate direction
      this.toLeftDirection = fromTabIndex > toTabIndex
      this.lastToTab = name
    },
    clearCalendar (dateValue) {
      // because date-picker doesn't have clear function we should check on Change that
      // values isn't set, don't want to separate it to another function, so checking it here
      if (dateValue?.length) {
        this.minDate = dateValue[0]
        this.maxDate = dateValue[1]
        return
      }

      this.setupStatisticValues(this.school.counts)
      this.calendarMode = false
      this.minDate = ''
      this.maxDate = ''
      this.statisticsTick += 1
    },
    startEndFormat (date, endDate = false) {
      if (!endDate) return moment(date).format('LLLL')
      else return date ? moment(date).format('LLLL') : moment(new Date()).format('LLLL')
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
        if (this.statsObject[key].type === 'completionStats') { statCompletionValues.push(this.statsObject[key]) } else if (this.statsObject[key].type === 'userStats') { statUserValues.push(this.statsObject[key]) } else if (this.statsObject[key].type === 'usersStats') { statStatsValues.push(this.statsObject[key]) } else if (this.calendarMode && this.statsObject[key].type === 'calendarStats') { calendarStatsValues.push(this.statsObject[key]) }
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
