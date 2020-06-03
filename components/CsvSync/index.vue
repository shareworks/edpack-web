<template>
  <div v-loading="loading" element-loading-text= "Loading groups">
    <div>
      <p class="mb-20">{{ $t('SW_CSV_SYNC_EXPLAIN_TEXT') }}</p>

      <!-- Upload csv file -->
      <csv-upload-form @addUsers="addUsers" @clearUsers="clearUsers" :existing="{students: currentUsers.length, groups: statsBeforeSync.groups.length}"></csv-upload-form>
    </div>

    <div v-if="csvUsers.length" v-loading="loadingStats" class="mt-20">
      <el-tabs type="border-card">
        <!-- Added -->
        <el-tab-pane>
          <div slot="label">
            {{ $t('SW_NEW') }} <el-tag type="success" size="mini">{{statsAfterSync.newUsers.length}}</el-tag>
          </div>
          <el-table size="small" :data="statsAfterSync.newUsers">
            <el-table-column prop="name" :label="$t('SW_NAME')" width="180"></el-table-column>
            <el-table-column prop="email" :label="$tc('SW_EMAIL', 1)" width="280"></el-table-column>
            <el-table-column prop="groupName" :label="$tc('SW_GROUP', 1)"></el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- Transferred -->
        <el-tab-pane>
          <div slot="label">
            {{ $t('SW_CHANGED') }} <el-tag type="warning" size="mini">{{statsAfterSync.transferredUsers.length}}</el-tag>
          </div>
          <el-table size="small" :data="statsAfterSync.transferredUsers">
            <el-table-column prop="name" :label="$t('SW_NAME')" width="180"></el-table-column>
            <el-table-column prop="email" :label="$tc('SW_EMAIL', 1)" width="280"></el-table-column>
            <el-table-column prop="fromGroupName" :label="$t('SW_FROM_GROUP')"></el-table-column>
            <el-table-column prop="toGroupName" :label="$t('SW_TO_GROUP')"></el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- Removed -->
        <el-tab-pane>
          <div slot="label">
            {{ $t('SW_REMOVED') }} <el-tag type="danger" size="mini">{{statsAfterSync.removedUsers.length}}</el-tag>
          </div>
          <el-table size="small" :data="statsAfterSync.removedUsers">
            <el-table-column prop="name" :label="$t('SW_NAME')" width="180"></el-table-column>
            <el-table-column prop="email" :label="$tc('SW_EMAIL', 1)" width="280"></el-table-column>
            <el-table-column prop="groupName" :label="$tc('SW_GROUP', 1)"></el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="mt-20">
      <el-button type="primary" size="medium" @click="syncWithCsv" :disabled="!csvUsers.length || loading || loadingStats" :loading="processingCsv">
        <i class="icon-repeat"></i>{{ $t('SW_SYNC_NOW') }}</el-button>
      <el-button class="ml-10" type="text" @click="closeDialog()">{{ $t('SW_CANCEL') }}</el-button>
    </div>
  </div>
</template>

<script>
import CsvUploadForm from '../CsvUploadForm'

const statsBeforeSync = { groups: [], groupsMap: {} }
const statsAfterSync = {
  newUsers: [],
  removedUsers: [],
  transferredUsers: [],

  groups: [],
  newGroups: [],
  removedGroups: [],
  changedGroups: [],

  unChangedGroups: [],
  groupsMap: {},
  newGroupsMap: {},
  removedGroupsMap: {},
  changedGroupsMap: {},
  unChangedGroupsMap: {}
}

export default {
  name: 'CsvSync',
  props: ['closeDialog', 'model'],
  components: { CsvUploadForm },

  data () {
    return {
      processing: false,
      user: this.$store.state.user,
      course: this.$store.state.course || null,
      lang: this.$store.state.lang,
      processingCsv: false,
      loading: false,
      loadingStats: false,
      csvUsers: [],
      currentUsers: [],
      statsBeforeSync: statsBeforeSync,
      statsAfterSync: statsAfterSync
    }
  },

  created () {
    this.getMembers()
  },

  methods: {
    getMembers () {
      this.loading = true
      this.$http.get(`${this.model.type}s/${this.model._id}/users`)
        .then((res) => { this.currentUsers = res.data.list })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.loading = false })
    },
    syncWithCsv () {
      if (!this.csvUsers.length) return this.$message({ message: this.$i18n.t('SW_NO_USERS'), type: 'error' })
      this.processingCsv = true

      const params = {}
      const form = Object.assign({}, this.model, { participants: this.csvUsers })

      this.$http.put(`${this.model.type}s/${form._id}/sync-users`, form, { params, timeout: 100000 })
        .then(() => {
          this.$message({ message: this.$i18n.t('SW_MODEL_SYNC_EXCEL'), type: 'success' })
          this.closeDialog(true)
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.processingCsv = false })
    },
    clearUsers () {
      this.csvUsers = []
      this.statsBeforeSync = JSON.parse(JSON.stringify(statsBeforeSync))
      this.statsAfterSync = JSON.parse(JSON.stringify(statsAfterSync))
    },
    addUsers (users) {
      this.clearUsers()

      this.csvUsers = users
      this.loadingStats = true

      for (const currentUser of this.currentUsers) {
        const user = this.csvUsers.find(el => currentUser.emails.includes(el.email))

        // Map all groups before sync
        if (!this.statsBeforeSync.groupsMap[currentUser.groupName]) this.statsBeforeSync.groupsMap[currentUser.groupName] = []
        this.statsBeforeSync.groupsMap[currentUser.groupName].push(currentUser)

        // Check if user is removed from Model
        if (!user) this.statsAfterSync.removedUsers.push(currentUser)
      }

      for (const user of this.csvUsers) {
        const currentUser = this.currentUsers.find(el => el.emails.includes(user.email))

        // Map all groups after sync
        if (!this.statsAfterSync.groupsMap[user.groupName]) this.statsAfterSync.groupsMap[user.groupName] = []
        this.statsAfterSync.groupsMap[user.groupName].push(user)

        // Check if user is new to Model
        if (!currentUser) this.statsAfterSync.newUsers.push(user)

        // Check if user transferred from group
        if (currentUser && user.groupName && currentUser.groupName && user.groupName !== currentUser.groupName) {
          this.statsAfterSync.transferredUsers.push({
            name: user.name,
            fromGroupName: currentUser.groupName,
            toGroupName: user.groupName,
            email: user.email
          })
        }
      }

      // Check new groups
      for (const key of Object.keys(this.statsAfterSync.groupsMap)) {
        this.statsAfterSync.newGroupsMap[key] = 1
      }

      // Check removed groups
      for (const key of Object.keys(this.statsBeforeSync.groupsMap)) {
        this.statsAfterSync.removedGroupsMap[key] = 1
      }

      // Check changed groups
      for (const key of Object.keys(this.statsAfterSync.groupsMap)) {
        if (this.statsAfterSync.newGroupsMap[key]) continue

        const groupBeforeSync = this.statsBeforeSync.groupsMap[key]
        const groupAfterSync = this.statsAfterSync.groupsMap[key]

        const removedUsers = []
        const newUsers = []
        let isChanged = false

        // Check if users left the group
        for (const user of groupBeforeSync) {
          if (!groupAfterSync.find(el => user.emails.includes(el.email))) {
            removedUsers.push(user)
            isChanged = true
          }
        }

        // Check if users added to the group
        for (const el of groupAfterSync) {
          if (!groupBeforeSync.find(user => user.emails.includes(el.email))) {
            newUsers.push(el)
            isChanged = true
          }
        }

        this.statsAfterSync.changedGroupsMap[key] = isChanged ? { removedUsers, newUsers } : groupBeforeSync
      }

      // Change maps to arrays
      this.statsAfterSync.removedGroups = Object.keys(this.statsAfterSync.removedGroupsMap)
      this.statsAfterSync.changedGroups = Object.keys(this.statsAfterSync.changedGroupsMap)
      this.statsAfterSync.newGroups = Object.keys(this.statsAfterSync.newGroupsMap)
      this.statsAfterSync.groups = Object.keys(this.statsAfterSync.groupsMap)
      this.statsBeforeSync.groups = Object.keys(this.statsBeforeSync.groupsMap)

      this.loadingStats = false
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
