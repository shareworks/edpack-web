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
        <el-button class="button-square-xs" plain size="medium" type="primary" @click="$router.push({name: 'settings', params: { slug: school.slug, mode: 'general' }})">
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
            <el-dropdown-item :command="{type: 'uptime'}">
              <i class="icon-cloud_done"></i>
              <span>{{ $t('SW_UPTIME_MONITOR') }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <!-- App language -->
        <app-language></app-language>
      </div>

      <!-- Header text -->
      <page-header :title="$t('SW_DASHBOARD')" :intro="$t('SW_DASHBOARD_SHORT', { school: currentUser.organization.name[lang] })" icon="icon-lock" :area="$t('SW_ADMIN_ONLY')">
        <p class="mt-10" v-if="school.counts">{{ $t('SW_DASHBOARD_LONG', [ school.counts.users || 0, school.counts.admins || 0, school.counts.staff || 0, school.counts.students || 0, school.counts.courses || 0, school.counts.evaluations || 0 ]) }}</p>
        <p class="mt-10" v-if="school.counts">{{ $t('SW_ORG_SUMMARY', [school.counts.usersThisYear]) }}</p>
      </page-header>

      <!-- Tabs -->
      <slot name="tabs"></slot>
    </page-cover>

    <div class="page-body">
      <!-- Tables -->
      <slot name="tables"></slot>

      <!-- Statistics dialog -->
      <el-dialog :title="$t('SW_STATS')" append-to-body :visible.sync="dialogStats">
        <statistics v-if="dialogStats" :closeDialog="toggleStats"></statistics>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import config from 'config'
import Statistics from '../Statistics'

export default {
  name: 'AdminPanelWrapper',
  metaInfo: { title: 'Admin' },
  props: ['mode', 'currentUser', 'school', 'setMode'],
  components: { Statistics },

  data () {
    return {
      loading: true,
      dialogStats: false,
      lang: this.$store.state.lang
    }
  },

  mounted () {
    this.getOrg()
  },

  watch: {
    $route (to) {
      if (to.params.mode !== this.mode) {
        this.setMode(to.params.mode)
      }
    }
  },

  methods: {
    getOrg () {
      this.$http.get(`organizations/${this.school._id}`)
        .then((res) => {
          Vue.util.extend(this.school, res.data.list[0])
          this.$store.state.user.organization = res.data.list[0]
          this.$store.dispatch('setUser', this.$store.state.user)
        })
        .catch((err) => { if (err.status === 404) this.$router.replace({ name: 'error', query: { type: 'not_found' } }) })
        .finally(() => { this.loading = false })
    },
    handleCommand (command) { if (command.type === 'uptime') window.open(config.business.uptimeUrl, '_blank') },
    toggleStats () { this.dialogStats = !this.dialogStats }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import 'style';
</style>
