<template>
  <div id="app">
    <vue-progress-bar></vue-progress-bar>
    <app-sidebar v-if="navAvailable" :closeSidebar="closeSidebar" :active="sidebarOpened" />
    <app-header v-if="navAvailable" :openSidebar="openSidebar"/>

    <!-- Main content -->
    <main :class="{ 'page-offset': pageOffset, 'nav-offset': navAvailable, 'page-lti': inLTI }">
      <el-row class="container">
        <router-view :key="resetKey">
          <spinner class="mt-30"></spinner>
        </router-view>
      </el-row>
    </main>

    <!-- Navigation stuff -->
    <app-footer v-if="showFooter"/>
    <div class="dimmer" v-if="sidebarOpened" :class="{'active': obfuscatorActive}" @click="closeSidebar"></div>
    <freshchat v-if="loadFreshchat"></freshchat>
    <x-browser-update :config="browserUpdateConfig"></x-browser-update>
    <reload-after-deploy></reload-after-deploy>

    <!-- Welcome dialog -->
    <el-dialog append-to-body :visible.sync="dialogWelcome">
      <welcome-dialog :closeDialog="closeDialog"></welcome-dialog>
    </el-dialog>
  </div>
</template>

<script>
import config from 'config'
import AppHeader from '../../components/AppHeader'
import AppSidebar from '../../components/AppSidebar'
import AppFooter from '../../components/AppFooter'
import { mapActions, mapState } from 'vuex'
import browserConfig from '../../utils/browser-update'
import WelcomeDialog from '../../components/WelcomeDialog'
import ReloadAfterDeploy from '../../components/ReloadAfterDeploy'

const mode = process.env.VUE_APP_MODE && process.env.VUE_APP_MODE !== 'production' ? process.env.VUE_APP_MODE.toUpperCase() : ''

export default {
  name: 'App',
  metaInfo: {
    title: 'Welcome',
    titleTemplate: '%s - ' + config.name + ' ' + mode
  },
  components: {
    WelcomeDialog, AppHeader, AppSidebar, AppFooter, ReloadAfterDeploy, Freshchat: () => import('../../components/Freshchat')
  },

  data () {
    return {
      browserUpdateConfig: browserConfig,
      inLTI: this.$store.state.inLTI,
      dialogWelcome: false,
      resetKey: 1
    }
  },

  mounted () {
    // Handle resize events
    window.addEventListener('resize', this.handleResize)
  },

  created () {
    this.$router.beforeEach((to, from, next) => {
      this.$Progress.start()
      next()
    })
    this.$router.afterEach(() => {
      this.$Progress.finish()
    })
  },

  watch: {
    currentUser (user) {
      // Show welcome dialog to new user
      if (user && !user.checks.welcome) this.showWelcomeDialog()
    },
    language (language) {
      if (language) this.resetKey++
    }
  },

  methods: {
    closeDialog () {
      this.dialogWelcome = false
    },
    showWelcomeDialog () {
      this.dialogWelcome = true
      this.$store.state.user.checks.welcome = true
      this.$http.put(`users/${this.currentUser._id}`, { checks: this.$store.state.user.checks })
        .then(() => { /*  User checks updated! */ })
    },
    ...mapActions(['handleResize', 'openSidebar', 'closeSidebar'])
  },

  computed: {
    ...mapState({
      language: state => state.user.language,
      currentUser: state => state.user,
      showFooter: state => state.route.meta.footer,
      sidebarOpened: state => state.sidebarOpened,
      obfuscatorActive: state => state.obfuscatorActive,
      pageOffset: state => state.route.meta.auth,
      loadFreshchat: (state) => {
        return state.user && state.school && state.school.enableFreshChat && state.school.role !== 'student'
      },

      navAvailable: (state) => {
        // Hide when not authenticated
        if (!state.route.meta.auth || state.route.meta.hideNav) return false
        // Hide when in LTI iframe
        return !state.inLTI
      }
    })
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
