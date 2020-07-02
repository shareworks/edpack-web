<template>
  <header class="app-header clearfix">
    <div class="header-container">

      <!-- Menu icon -->
      <el-button type="text" class="menu-button visible-xs visible-sm" @click="openSidebar" aria-label="Toggle menu">
        <i class="icon-menu"></i>
      </el-button>

      <!-- Menu buttons-->
      <el-menu class="hidden-xs hidden-sm header-tabs pull-left" mode="horizontal" :default-active="activeTab">
        <el-menu-item index="home" @click="tabClick('home')">
          <span>{{ $t('SW_HOME') }}</span>
        </el-menu-item>
        <el-menu-item v-if="isAdmin" index="admin" @click="tabClick('admin')">
          <span>{{ $t('SW_DASHBOARD') }}</span>
        </el-menu-item>

        <el-button class="assessments-left-btn text-white" size="small">
          <span>{{ assessmentsLeft }} {{ $t('SW_ASSESSMENTS_LEFT') }}</span>
        </el-button>

        <el-menu-item index="" class="hide"></el-menu-item>
      </el-menu>

      <!-- Header logo or text -->
      <router-link to="/home" aria-hidden="true" tabindex="-1">
        <div v-if="school.appName" class="app-header-title">{{ school.appName }}</div>
        <div v-else class="header-logo"></div>
      </router-link>

      <!-- User dropdown menu -->
      <div class="header-user-container" v-if="user">
        <!-- Toggle organization -->
        <div class="hidden-xs hidden-sm org-select" v-if="userOrgs.length > 1">
          <el-select size="small" v-model="selectedOrg" :filterable="userOrgs.length > 5" :placeholder="$t('SW_SELECT_SCHOOL')" @change="changeOrg">
            <el-option v-for="org in userOrgs" :key="org._id" :label="org.name[lang]" :value="org._id">
              <i class="icon-school"></i>
              <span>{{ org.name[lang] }}</span>
            </el-option>
          </el-select>
        </div>

        <!-- User account -->
        <router-link class="user-account-link" :to="{ name: showProfile ? 'profile' : 'account', params: { slug: school.slug, id: user._id } }" aria-label="Account page">
          <thumbnail :model="user" class="thumb-user mr-5 thumb-24"></thumbnail>
          <strong class="hidden-sm-inline user-name">{{user.name}}</strong>
        </router-link>
      </div>
    </div>
  </header>
</template>

<script>
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
      userOrgs: this.$store.state.user.organizations,
      assessmentsLeft: this.$store.state.user.assessmentLimits.length
    //  assessmentsLeft will be changed
    }
  },

  watch: {
    $route (to) {
      if (to.name === 'admin') this.activeTab = 'admin'
      else if (to.name === 'home') this.activeTab = 'home'
      else this.activeTab = ''
    }
  },

  computed: {
    user () {
      return this.$store.state.user
    },
    isAdmin () {
      return this.$store.state.user.systemAdmin || this.$store.state.user.organization.role === 'admin'
    }
  },

  methods: {
    changeOrg (orgID) {
      this.$http.put(`session/context?organization=${orgID}`)
        .then(() => { window.location = window.location.origin })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
    },
    tabClick (tab) {
      this.activeTab = tab
      let route = { name: tab, params: { slug: this.school.slug } }
      if (tab === 'admin') route = '/admin'
      this.$router.push(route)
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
