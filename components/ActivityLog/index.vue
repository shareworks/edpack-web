<template>
  <div>
    <page-cover class="mb-30">
      <page-header :title="$t('SW_ACTIVITY_LOG')" :intro="$t('SW_ACTIVITY_LOG_TEXT')"/>
    </page-cover>

    <div class="activity-log-body" ref="activityLogBody">
      <el-row type="flex" justify="left" class="mb-20" align="middle">
        <el-col :xs="4" :sm="4" class="mr-5">
          <el-select v-model="contentFilter" clearable @change="changedFilter('content')" :placeholder="$t('SW_SELECT_CONTENT')">
            <el-option v-for="item in getFilters('content')" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-col>

        <el-col :xs="4" :sm="4">
          <el-select v-model="actionFilter" clearable @change="changedFilter('action')" :placeholder="$t('SW_SELECT_ACTION')">
            <el-option v-for="item in getFilters('action')" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-col>

        <el-col :xs="{span: 10, offset: 6}" :sm="{span: 10, offset: 6}">
          <el-input size="medium" class="block" v-model="searchText" clearable prefix-icon="icon-search" :placeholder="$t('SW_SEARCH_BY_NAME_EMAIL')"/>
        </el-col>
      </el-row>

      <el-table :data="activities" border>
        <!-- Date -->
        <el-table-column width="220px" :label="$t('SW_DATE')">
          <template slot-scope="scope">
            {{dateFormatter(scope.row)}}
          </template>
        </el-table-column>

        <!-- Content -->
        <el-table-column :label="$t('SW_CONTENT')" width="180px">
          <template slot-scope="scope">
            {{getSubject(scope.row)}}
          </template>
        </el-table-column>

        <!-- Action -->
        <el-table-column width="120px" :label="$t('SW_ACTION')">
          <template slot-scope="scope">
            {{getAction(scope.row)}}
          </template>
        </el-table-column>

        <!-- Amount -->
        <el-table-column width="80px" :label="$t('SW_AMOUNT')">
          <template slot-scope="scope">
            <el-tag size="mini" v-if="getTagAmount(scope.row).amount" :type="getTagAmount(scope.row).tagType">{{getTagAmount(scope.row).amount}}</el-tag>
          </template>
        </el-table-column>

        <!-- Information -->
        <el-table-column :label="$t('SW_INFORMATION')">
          <template slot-scope="scope">
            {{getInformation(scope.row)}}
          </template>
        </el-table-column>

        <!-- Participant -->
        <el-table-column :label="$t('SW_USER')" prop="userName"/>
      </el-table>
      <mugen-scroll :handler="getActivities" scroll-container="activityLogBody" :handle-on-mount="false" :should-handle="status === 'incomplete'"/>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import debounce from 'lodash/debounce'

export default {
  name: 'ActivityLog',
  props: ['contentFilters', 'actionFilters', 'assessment'],

  data () {
    return {
      evaluation: this.$store.state.buddycheck?.evaluation || {},
      status: false,
      activities: [],
      skip: 0,
      contentFilter: '',
      actionFilter: '',
      searchText: ''
    }
  },

  watch: {
    searchText: debounce(function () { this.changedFilter('name') }, 400)
  },

  mounted () {
    this.getActivities()
  },

  methods: {
    changedFilter (type) {
      if (type === 'content' && this.actionFilter && this.contentFilter) this.actionFilter = ''

      this.activities = []
      this.status = 'none'
      this.skip = 0
      this.getActivities()
    },

    getFilters (type) {
      if (type === 'content') {
        return this.contentFilters
      }

      if (type === 'action') {
        if (!this.contentFilter) return this.actionFilters
        return this.actionFilters.filter(el => el.contents.includes(this.contentFilter))
      }
    },

    getActivities () {
      if (this.status === 'loading') return
      this.status = 'loading'

      const params = { skip: this.skip, amount: 20 }

      if (this.assessment) params.assessment = this.assessment._id
      else params.evaluation = this.evaluation._id

      if (this.contentFilter) params.contentType = this.contentFilter
      if (this.actionFilter) params.activityType = this.actionFilter
      if (this.searchText) params.filter = this.searchText

      const hasFilter = (this.contentFilter || this.actionFilter || this.searchText)

      this.$http.get('activities', { params: params })
        .then((res) => {
          this.status = res.data.total ? (res.data.done ? 'done' : 'incomplete') : (hasFilter ? 'noResults' : 'none')
          this.activities = this.activities.concat(res.data.list)
          this.skip = res.data.skip
        })
        .catch(() => {
          this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') })
          this.status = 'error'
        })
        .finally(() => { this.loading = false })
    },

    getAction (activity) {
      if (activity.activityType === 'delete_user') return this.$i18n.t('SW_REMOVED_USER')
      else if (activity.activityType === 'submit') return this.assessment ? this.$i18n.t('SW_UPLOAD') : this.$i18n.t('SW_SUBMIT')
      else if (activity.activityType === 'add') return this.$i18n.t('SW_CREATE')

      return (activity.activityType.charAt(0).toUpperCase() + activity.activityType.slice(1)).replace('_', ' ')
    },

    getSubject (activity) {
      return (activity.contentType.charAt(0).toUpperCase() + activity.contentType.slice(1))
    },

    getTagAmount (activity) {
      let amount
      let tagType

      const checkContentIds = this.useAssessment
        ? ['feedback', 'submission', 'comparison'].includes(activity.contentType) || (activity.activityType === 'submit' && activity.contentType === 'feedback')
        : ['survey'].includes(activity.contentType)

      const checkSubContentIds = ['invite_user', 'delete_user'].includes(activity.activityType) || (activity.activityType === 'submit' && activity.contentType === 'feedback')

      if (checkContentIds) amount = activity.contentIds.length
      if (checkSubContentIds) amount = activity.subContentIds.length

      if (activity.activityType === 'reminder') {
        if (activity.newContent.emailsFailed?.length) tagType = 'danger'
        else tagType = 'success'

        amount = `${(activity.newContent.emailsSucceeded?.length || 0)} / ${(activity.newContent.emailsSucceeded?.length || 0) + (activity.newContent.emailsFailed?.length || 0)}`
      }

      return { amount, tagType: tagType || (amount > 1 ? 'danger' : '') }
    },

    dateFormatter (activity) {
      return moment(activity.createdDate).format('MMMM Do YYYY, h:mm a')
    },

    getInformation (activity) {
      if (!activity.tags || !activity.tags.length) return ''

      const convertedStrings = activity.tags.map(el => (el.charAt(0).toUpperCase() + el.slice(1)).replace('_', ' '))
      return convertedStrings.join(', ')
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
