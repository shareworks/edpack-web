<template>
  <header class="app-header clearfix">
    <div class="header-container">

      <!-- Menu icon -->
      <el-button type="text" class="menu-button visible-xs visible-sm" @click="openSidebar" aria-label="Toggle menu">
        <i class="icon-menu"/>
      </el-button>

      <!-- Menu buttons-->
      <el-menu class="hidden-xs hidden-sm header-tabs pull-left" mode="horizontal" :default-active="activeTab">
        <el-menu-item index="home" @click="tabClick('home')">
          <span>{{ $t('SW_HOME') }}</span>
        </el-menu-item>
        <el-menu-item v-if="isAdmin" index="admin" @click="tabClick('admin')">
          <span>{{ $t('SW_DASHBOARD') }}</span>
        </el-menu-item>

        <el-button :type="user.credits && user.credits.used < user.credits.limit ? 'success' : 'danger'" size="small"
                   @click="dialogRemaining = true" v-if="user.role !== 'student' && school.creditsEnabled && payAsYouGo"
                   class="assessment-limit">
          <strong class="visible-sm-inline visible-xs-inline"><i class="icon-done_all"/></strong>
          <strong v-if="user.credits"> {{ user.credits.used > user.credits.limit ? 0 : user.credits.limit - user.credits.used }} </strong>
          <strong v-else> 0 </strong>
          <strong class="hidden-xs hidden-sm">{{ $t('SW_ASSESSMENTS_LEFT') }}</strong>
        </el-button>

        <el-menu-item index="" class="hide"/>
      </el-menu>

      <!-- Header logo or text -->
      <router-link v-if="!showSchoolSelect" to="/home" aria-hidden="true" tabindex="-1">
        <div v-if="school.appName" class="app-header-title">{{ school.appName }}</div>
        <div v-else class="header-logo"></div>
      </router-link>

      <!-- Select organization -->
      <div class="header-school-container visible-xs visible-sm" v-else>
        <div class="org-select">
          <el-select size="small" v-model="selectedOrg" :filterable="userOrgs.length > 5" :placeholder="$t('SW_SELECT_SCHOOL')" @change="changeOrg">
            <el-option v-for="org in userOrgs" :key="org._id" :label="org.name[lang]" :value="org._id">
              <i class="icon-school"/>
              <span>{{ org.name[lang] }}</span>
            </el-option>
          </el-select>
        </div>
      </div>

      <!-- User dropdown menu -->
      <div class="header-user-container" v-if="user">
        <!-- Toggle organization -->
        <div class="hidden-xs hidden-sm org-select" v-if="userOrgs.length > 1">
          <el-select size="small" v-model="selectedOrg" :filterable="userOrgs.length > 5" :placeholder="$t('SW_SELECT_SCHOOL')" @change="changeOrg">
            <el-option v-for="org in userOrgs" :key="org._id" :label="org.name[lang]" :value="org._id">
              <i class="icon-school"/>
              <span>{{ org.name[lang] }}</span>
            </el-option>
          </el-select>
        </div>

        <!-- Show school selection -->
        <div class="org-select" v-if="showOrgButton && userOrgs.length > 1">
          <el-button type="primary" class="button-square-xs" plain size="small" @click="showSchoolSelect = !showSchoolSelect">
            <i class="icon-list"/>
            <span class="hidden-xs">{{ $tc('SW_ORGANIZATION', 2) }}</span>
          </el-button>
        </div>

        <!-- User account -->
        <router-link class="user-account-link" :to="{ name: showProfile ? 'profile' : 'account', params: { slug: school.slug, id: user._id } }" aria-label="Account page">
            <thumbnail tabindex="0" :model="user" class="thumb-user mr-5 thumb-24"/>
            <strong class="hidden-sm-inline user-name">{{user.name}}</strong>
        </router-link>
      </div>
    </div>

    <!-- Pay as you go limit -->
    <el-dialog :title="$t('SW_CREDITS_INFO')" append-to-body :visible.sync="dialogRemaining" v-if="payAsYouGo">
      {{ $t('SW_CREDITS_REMAINING_INFO', [school.name[lang]])}} <a href="#" @click.prevent="openChat">{{ $t('SW_CONTACT_SUPPORT') }}</a>.

      <div v-if="user.credits && user.credits.exp">
        <strong class="hidden-xs hidden-sm"><i class="icon-time"/></strong>
        <strong>{{ prettyDate(user.credits.exp) }}</strong>
      </div>
    </el-dialog>
  </header>
</template>

<script>
import moment from 'moment'
import config from 'config'

export default {
  name: 'AppHeader',
  props: ['openSidebar'],

  data () {
    return {
      school: this.$store.state.user.organization,
      activeTab: this.$route.name || 'admin',
      lang: this.$store.state.lang,
      showProfile: config.hasUserProfiles,
      selectedOrg: this.$store.state.user.organization.name[this.$store.state.user.language],
      showSchoolSelect: false,
      showOrgButton: false,
      payAsYouGo: config.payAsYouGo,
      dialogRemaining: false
    }
  },

  watch: {
    $route (to) {
      if (to.name === 'admin') this.activeTab = 'admin'
      else if (to.name === 'home') this.activeTab = 'home'
      else this.activeTab = ''
    }
  },

  created () {
    window.addEventListener('resize', this.resizeHandler)
    this.resizeHandler()
  },
  destroyed () {
    window.removeEventListener('resize', this.resizeHandler)
  },

  computed: {
    user () { return this.$store.state.user },
    userOrgs () {
      const orgs = this.$store.state.user.organizations
      return orgs.sort((a, b) => { return a.name.en.toLowerCase().localeCompare(b.name.en.toLowerCase()) })
    },
    isAdmin () { return this.$store.state.user.systemAdmin || this.$store.state.user.role === 'admin' }
  },

  methods: {
    resizeHandler () {
      if (document.documentElement.clientWidth >= 991) {
        this.showSchoolSelect = false
        this.showOrgButton = false
      } else {
        this.showOrgButton = true
      }
    },
    prettyDate (date) { return moment(new Date(date)).format('LLL') },
    changeOrg (orgID) {
      this.$http.put(`session/context?organization=${orgID}`)
        .then(() => { window.location = window.location.origin })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
    },
    tabClick (tab) {
      this.activeTab = tab
      const route = { name: tab, params: { slug: this.school.slug } }
      if (this.$route.name !== tab) this.$router.push(route)
    },
    openChat () { window.fcWidget.open() }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
