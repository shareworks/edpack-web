<template>
  <div>
    <page-cover>
      <div class="pull-right">
        <!-- Statistics -->
        <el-button size="medium" @click="toggleStats" class="button-square-xs">
          <i class="icon-stats"></i>
          <span class="hidden-xs hidden-sm">{{ $t('SW_STATS') }}</span>
        </el-button>

        <!-- School settings -->
        <el-button class="button-square-xs" plain size="medium" type="primary" @click="$router.push({name: 'settings', params: { slug: school.slug, settingsMode: 'general' }})">
          <i class="icon-cog"></i>
          <span class="hidden-xs">{{ $t('SW_SETTINGS') }}</span>
        </el-button>

        <!-- More options -->
        <el-dropdown rigger="click" @command="handleCommand">
          <el-button type="primary" size="medium" class="button-square-xs ml-5">
            <span class="hidden-xs">{{ $t('SW_MORE') }}</span>
            <i class="el-icon-caret-bottom el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :command="{type: 'uptime'}" v-if="uptimeUrl">
              <i class="icon-cloud_done"></i>
              <span>{{ $t('SW_UPTIME_MONITOR') }}</span>
            </el-dropdown-item>
            <el-dropdown-item v-if="currentUser.systemAdmin" :command="{type: 'tokens'}">
              <i class="icon-delete"></i>
              <span>{{ $t('SW_CLEAR_TOKENS') }}</span>
            </el-dropdown-item>
            <el-dropdown-item v-if="currentUser.systemAdmin" :command="{type: 'test-mailing'}">
              <i class="icon-delete"></i>
              <span>{{ $t('SW_TEST_MAILING') }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <!-- App language -->
        <app-language/>
      </div>

      <!-- Header text -->
      <page-header :title="$t('SW_DASHBOARD')" :intro="$t('SW_DASHBOARD_SHORT', { school: currentUser.organization.name[lang] })" icon="icon-lock" :area="$t('SW_ADMIN_ONLY')">
        <p class="mt-10" v-if="school.counts">
          {{ $t('SW_DASHBOARD_LONG', [ school.counts.users || 0, school.counts.admins || 0, school.counts.staff || 0, school.counts.students || 0, school.counts.courses || 0, appName ]) }}
          {{ $t('SW_ORG_SUMMARY', [school.counts.activeAfterSept || 0]) }}
        </p>
      </page-header>

      <!-- Tabs -->
      <el-tabs v-model="toTab" @tab-click="tabClick" class="mt-10">
        <el-tab-pane v-for="tab in tabs" :label="tab.label" :name="tab.value" :key="tab.value"/>
      </el-tabs>
    </page-cover>

    <div class="page-body" v-if="status === 'done'">
      <!-- test mailing dialog -->
      <el-dialog append-to-body :visible.sync="testMailingDialog" :title="$t('SW_TEST_MAILING')">
        <test-mailing-dialog v-if="testMailingDialog" :closeDialog="closeTestMailingDialog"/>
      </el-dialog>

      <!-- Content Component -->
      <transition mode="out-in" :enter-active-class="enterClass" :leave-active-class="leaveClass">
        <component :is="tabs[mode].name"/>
      </transition>

      <!-- Statistics dialog -->
      <el-dialog :title="$t('SW_STATS')" append-to-body :visible.sync="dialogStats">
        <statistics v-if="dialogStats" :closeDialog="toggleStats" :stats="stats"/>
      </el-dialog>
    </div>

    <!-- Loading -->
    <spinner v-else-if="status === 'loading'" class="mt-30"/>

    <!-- Error -->
    <div v-else-if="status === 'error'" class="text-muted text-center mt-30">{{ $t('SW_ERROR_LOADING') }}</div>
  </div>
</template>

<script>
import config from 'config'
import Statistics from '@/edpack-web/components/Statistics'
import OrgsTable from '@/edpack-web/components/OrgsTable'
import UsersTable from '@/edpack-web/components/UsersTable'
import TestMailingDialog from '@/edpack-web/components/TestMailingDialog'

export default {
  name: 'AdminPanelWrapper',
  metaInfo: { title: 'Admin' },
  props: ['stats', 'tabs'],
  components: { Statistics, OrgsTable, UsersTable, TestMailingDialog },

  data () {
    return {
      enterClass: '',
      leaveClass: '',
      school: this.$store.state.school,
      currentUser: this.$store.state.user,
      mode: this.$route.params.mode || config.defaultAdminTab,
      toTab: this.$route.params.mode || config.defaultAdminTab,
      dialogStats: false,
      appName: config.name,
      submitting: false,
      uptimeUrl: config.business.uptimeUrl,
      lang: this.$store.state.lang,
      status: 'loading',
      testMailingDialog: false
    }
  },

  created () {
    this.getOrg()
  },

  watch: {
    $route (to) {
      if (!to.params.mode) to.params.mode = config.defaultAdminTab
      if (to.params.mode !== this.mode) {
        this.mode = to.params.mode
        this.toTab = to.params.mode
      }
    }
  },

  methods: {
    getOrg () {
      this.$http.get(`organizations/${this.school._id}`)
        .then((res) => {
          // Use JSON.parse(JSON.stringify(obj)) to prevent deep bindings, see Vue.utils.extend issue: https://github.com/vuejs/vue/issues/1849
          this.school = JSON.parse(JSON.stringify(res.data.list[0]))
          this.$store.state.user.organization = res.data.list[0]
          this.$store.dispatch('setUser', this.$store.state.user)
          this.status = 'done'
        })
        .catch(() => { this.status = 'error' })
    },
    handleCommand (command) {
      if (command.type === 'uptime') window.open(this.uptimeUrl, '_blank')
      if (command.type === 'tokens') this.confirmClearTokens()
      if (command.type === 'test-mailing') this.testMailingDialog = true
    },
    confirmClearTokens () {
      if (this.submitting) return

      this.$confirm(this.$i18n.t('SW_CLEAR_TOKENS_TEXT'), this.$i18n.tc('SW_CLEAR_TOKENS'), {
        confirmButtonText: this.$i18n.t('SW_REMOVE'),
        cancelButtonText: this.$i18n.t('SW_CANCEL')
      }).then(() => { this.clearTokens() })
        .catch(() => { })
    },
    clearTokens () {
      this.submitting = true

      this.$http.put(`organizations/${this.school._id}/clean-access-tokens`)
        .then(() => { this.$message({ message: this.$i18n.t('SW_TOKENS_CLEARED'), type: 'success' }) })
        .catch(() => { this.$message({ message: this.$i18n.t('SW_GENERIC_ERROR'), type: 'error' }) })
        .finally(() => { this.submitting = false })
    },
    toggleStats () { this.dialogStats = !this.dialogStats },
    closeTestMailingDialog () { this.testMailingDialog = false },
    tabClick () {
      if (this.toTab === this.mode) return
      this.enterClass = ''
      this.leaveClass = ''

      // initial value
      let fromTabIndex = null
      let toTabIndex = null

      let index = 0
      // run over object props
      for (const tab in this.tabs) {
        const tabValue = this.tabs[tab].value

        if (tabValue === this.mode) fromTabIndex = index
        if (tabValue === this.toTab) toTabIndex = index
        index++
      }

      // calculate direction
      this.leaveClass = fromTabIndex > toTabIndex ? 'to-right' : 'to-left'
      this.enterClass = fromTabIndex > toTabIndex ? 'from-left' : 'from-right'

      // show new tab
      this.$router.replace({ name: 'admin', params: { mode: this.toTab, slug: this.school.slug } })
        .catch(() => { this.toTab = this.mode })
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import 'style';
</style>
