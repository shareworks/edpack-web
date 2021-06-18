<template>
  <div class="statistics-ackee">
    <h2>Visitors/views</h2>
    <!-- facts -->
    <masonry v-if="facts" :cols="{default: 3, 767: 2}" :gutter="{default: '20px', 767: '10px'}">

      <el-card v-for="(fact, index) in facts" :key="`facts-${index}`" class="stat-counter">
        <h2>{{ fact.title }}</h2>
        <div class="font-20">
          <span v-if="('count' in fact)"><strong class="counter"><countTo :startVal='0' :endVal='fact.count' separator="." :duration='4000'/></strong> <span class="small-text">{{fact.text}}</span></span>
          <span v-else-if="('value' in fact)"><strong class="counter">{{fact.value}}</strong> <span class="small-text">{{fact.text}}</span></span>
        </div>
      </el-card>
    </masonry>

    <!-- Site views -->
    <masonry v-if="viewsChart" :cols="{default: 1, 767: 2}" :gutter="{default: '20px', 767: '10px'}">
      <h2>Site views</h2>
      <bar-chart :data="viewsChart.data" :options="viewsChart.options" :key="`site-views-chart`"></bar-chart>
    </masonry>

    <!-- Durations -->
    <masonry v-if="durationsChart" :cols="{default: 1, 767: 2}" :gutter="{default: '20px', 767: '10px'}">
      <h2>Durations</h2>
      <bar-chart :data="durationsChart.data" :options="durationsChart.options" :key="`durations-chart`"></bar-chart>
    </masonry>

    <!-- Pages and Referrers -->
    <masonry v-if="tables" :cols="{default: 2, 767: 2}" :gutter="{default: '20px', 767: '10px'}">
      <div v-for="(table, index) in tables" :key="`tables-${index}`">

        <h2>{{ table.title }}</h2>

        <el-card>
          <h2>{{ table.subTitle }}</h2>
          <div class="font-20">
            <el-table :data="table.data" style="width: 100%" height="300">

              <el-table-column v-if="table.favicon" prop="favicon" label="" width="50">
                <template slot-scope="scope">
                  <el-avatar :src="scope.row.favicon" size="small"></el-avatar>
                </template>
              </el-table-column>

              <el-table-column prop="count" :label="table.labels[0]" width="80">
                <template slot-scope="scope">
                  <el-tag type="danger" size="small">{{`x${scope.row.count}`}}</el-tag>
                </template>
              </el-table-column>

              <el-table-column prop="id" :label="table.labels[1]">
                <template slot-scope="scope">
                  <span v-if="!scope.row.url">{{scope.row.id}}</span>
                  <span v-else>
                    <p> <a :href="scope.row.url">{{scope.row.id}}</a></p>
                    <span v-if="scope.row.sub" class="small-text"> {{scope.row.sub}}</span>
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>

      </div>
    </masonry>
  </div>
</template>

<script>
import countTo from 'vue-count-to'
import moment from 'moment'
import Ackee from '../../utils/ackee'
import BarChart from '@/edpack-web/components/BarChart'

export default {
  name: 'StatisticsAckee',
  props: {
    faculty: { default: false },
  },
  components: { countTo, BarChart },

  data () {
    return {
      school: this.$store.state.school,
      facts: false,

      viewsChart: false,
      durationsChart: false,

      tables: false,
    }
  },

  mounted () {
    this.get()
  },

  methods: {
    async get () {
      if (!Ackee.canRequest()) return

      try {
        const [resStats, resFacts] = await Promise.all(['statistics', 'facts'].map(type => Ackee.request(type, { organization: this.school._id })))
        this.visualizeStatistics(resStats.data.data.domain.statistics)
        this.visualizeFacts(resFacts.data.data.domain.facts)
      } catch (err) {
        console.log(err)
      }
    },

    visualizeFacts (data) {
      this.facts = [
        { title: 'Active visitors', count: data.activeVisitors, text: this.pluralize(['visitors', 'visitor', 'visitors'], data.activeVisitors) },
        { title: 'Average views', count: data.averageViews, text: 'per day' },
        { title: 'Average duration', ...this.formatDuration(data.averageDuration) },
        { title: 'Views today', count: data.viewsToday, text: this.pluralize(['views', 'view', 'views'], data.viewsToday) },
        { title: 'Views this month', count: data.viewsMonth, text: this.pluralize(['views', 'view', 'views'], data.viewsMonth) },
        { title: 'Views this year', count: data.viewsYear, text: this.pluralize(['views', 'view', 'views'], data.viewsYear) },
      ]
    },

    visualizeStatistics (data) {
      this.visualizeViews(data.views)
      this.visualizeDurations(data.durations)

      this.tables = [
        { title: 'Pages', subTitle: 'Last 24 hours', data: data.pages.map(el => { return { ...el, url: el.id } }), labels: ['Views', 'Pages'] },
        { title: 'Referrers', subTitle: 'Last 24 hours', favicon: true, data: data.referrers.map(el => { return { ...el, ...this.formatUrl(el.id, true) } }), labels: ['', ''] },
        { title: 'Systems', subTitle: 'Last 24 hours', data: data.systems, labels: ['Amount', 'System'] },
        { title: 'Devices', subTitle: 'Last 24 hours', data: data.devices, labels: ['Amount', 'Device'] },
        { title: 'Browsers', subTitle: 'Last 24 hours', data: data.browsers, labels: ['Amount', 'Browser'] },
        { title: 'Sizes', subTitle: 'Last 24 hours', data: data.sizes, labels: ['Amount', 'Size'] },
        { title: 'Languages', subTitle: 'Last 24 hours', data: data.languages, labels: ['Amount', 'Language'] },
      ]
    },

    visualizeViews (views) {
      const result = views.reduce((acc, curr) => { acc.data.push(curr.count); acc.labels.push(this.getDay(curr.id)); return acc }, { labels: [], data: [] })
      const options = { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, legend: { display: false } }
      this.viewsChart = { data: { labels: result.labels, datasets: [{ backgroundColor: '#f87979', data: result.data }] }, options }
    },

    visualizeDurations (durations) {
      const result = durations.reduce((acc, curr) => { acc.data.push(this.msToM(curr.count)); acc.labels.push(this.getDay(curr.id)); return acc }, { labels: [], data: [] })
      const options = { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, legend: { display: false } }
      this.durationsChart = { data: { labels: result.labels, datasets: [{ backgroundColor: '#b08ff8', data: result.data }] }, options }
    },

    getDay (date) {
      return moment(date).calendar(null, {
        lastWeek: () => `[${moment(date).fromNow()}]`,
        lastDay: '[Yesterday]',
        sameDay: '[Today]',
        sameElse: () => `[${moment(date).fromNow()}]`
      })
    },

    pluralize (opts, num) {
      switch (num) {
      case 0: return opts[0]
      case 1: return opts[1]
      default: return opts[2]
      }
    },

    msToM (ms) {
      return (Math.floor(ms / 60000) + (((ms % 60000) / 1000).toFixed(0) / 100))
    },

    formatUrl (url) {
      const info = (new URL(url))
      return { id: info.origin, sub: url.replace(info.origin, ''), favicon: `${info.origin}/favicon.ico`, url }
    },

    formatDuration (ms) {
      const cleanZeros = (str) => str.replace(/(:00:00|:00)$/, '').replace(/^0/, '')
      const duration = new Date(ms).toISOString().substr(11, 8)

      const hasMinutes = duration.match(/^00:00:/) == null
      const hasHours = duration.match(/^00:/) == null

      return {
        value: !hasMinutes ? cleanZeros(duration.substr(6)) : !hasHours ? cleanZeros(duration.substr(3)) : cleanZeros(duration),
        text: !hasMinutes ? 's' : !hasHours ? 'm' : 'h'
      }
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import 'style';
</style>
