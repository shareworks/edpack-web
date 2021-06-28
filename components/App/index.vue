<template>
  <div id="app">
    <VueAnnouncer />
    <vue-progress-bar/>
    <app-sidebar v-if="navAvailable" :closeSidebar="closeSidebar" :active="sidebarOpened"/>
    <app-header v-if="navAvailable" :openSidebar="openSidebar"/>
    <lti-header v-if="showLtiHeader"/>

    <!-- Main content -->
    <main :class="{ 'page-offset': pageOffset, 'nav-offset': navAvailable || showLtiHeader, 'page-lti': inLTI && !showLtiHeader }">

      <el-alert type="error" class="no-border-radius text-center" effect="dark" show-icon :closable="false" v-if="!serverOnline">
        <spinner v-if="checkConnectionLoading"/>
        <p v-else>
          <span class="mr-5">{{ $t('SW_SERVER_MAINTENANCE', [appName]) }} <a href="https://status.shareworks.nl/" class="check-status-button bold is-underline" target="_blank">{{ $t('SW_CHECK_STATUS') }}</a>.</span>
          <span>{{ $t('SW_RETRY_IN', [countdownNumber]) }} </span>
          <el-button class="inline ml-5" size="mini" @click="checkConnection">{{ $t('SW_RETRY_NOW') }}</el-button>
        </p>

      </el-alert>
      <el-alert type="warning" class="no-border-radius text-center" effect="dark" show-icon :title="$t('SW_COOKIE_WARNING', [appName])" v-if="cookieWarning"/>

      <el-row class="container">
        <router-view :key="resetKey">
          <spinner class="mt-30"/>
        </router-view>
      </el-row>
    </main>

    <!-- Navigation stuff -->
    <app-footer v-if="showFooter"/>
    <div class="dimmer" v-if="sidebarOpened" :class="{'active': obfuscatorActive}" @click="closeSidebar"/>
    <freshchat v-if="loadFreshchat"/>
    <x-browser-update :config="browserUpdateConfig"/>
    <reload-after-deploy/>

    <!-- Welcome dialog -->
    <focus-trap :active="dialogWelcome" v-if="dialogWelcome">
      <el-dialog custom-class="welcome-dialog" :class="currentUser.contrastMode ? 'contrast-mode' : ''" append-to-body :visible.sync="dialogWelcome">
        <welcome-dialog :closeDialog="toggleDialog"/>
      </el-dialog>
    </focus-trap>

    <!-- Contact dialog -->
    <focus-trap :active="contactFormOpened" v-if="contactFormOpened">
      <el-dialog :title="$t('SW_CONTACT_US')" append-to-body :visible="contactFormOpened" @close="setContactForm">
        <contact-form v-if="contactFormOpened" :closeDialog="setContactForm"/>
      </el-dialog>
    </focus-trap>
  </div>
</template>

<script>
import config from 'config'
import Bugsnag from '@bugsnag/js'
import { mapActions, mapState } from 'vuex'

import AppHeader from '../../components/AppHeader'
import LtiHeader from '../../components/LtiHeader'
import AppFooter from '../../components/AppFooter'
import AppSidebar from '../../components/AppSidebar'
import browserConfig from '../../utils/browser-update'
import ContactForm from '../../components/ContactForm'
import WelcomeDialog from '../../components/WelcomeDialog'
import ReloadAfterDeploy from '../../components/ReloadAfterDeploy'

export default {
  name: 'App',
  metaInfo: {
    title: 'Welcome',
    titleTemplate: '%s - ' + config.name + ' ' + (config.releaseStage !== 'production' ? config.releaseStage.toUpperCase() : '')
  },
  components: {
    ContactForm, WelcomeDialog, AppHeader, LtiHeader, AppSidebar, AppFooter, ReloadAfterDeploy, Freshchat: () => import('../../components/Freshchat')
  },

  data () {
    return {
      browserUpdateConfig: browserConfig,
      inLTI: this.$store.state.inLTI,
      lang: this.$store.state.lang,
      dialogWelcome: false,
      resetKey: 1,
      disableWelcome: false,
      serverOnline: true,
      appName: config.name,
      releaseStage: config.releaseStage,
      checkConnectionLoading: false,
      countdownFunction: null,
      countdownNumber: 30,
      cookieWarning: config.cookieWarning && !navigator.cookieEnabled
    }
  },

  created () {
    this.$router.beforeEach((to, from, next) => {
      this.$Progress.start()
      next()
    })
    this.$router.afterEach(() => {
      this.$Progress.finish()
    })

    // we intercept error,
    // the error when api doesn't response is undefined
    // if error exist but === undefined -> do checkConnection()
    this.$http.interceptors.response.use(
      (response) => { return response },
      (error) => {
        // debounce didn't work here ;(
        if (error === undefined && !this.checkConnectionLoading) this.checkConnection()
        return Promise.reject(error)
      })
  },

  mounted () {
    window.addEventListener('unhandledrejection', e => {
      if (e?.message?.includes('ResizeObserver')) { return e.preventDefault() }
      if (e?.error?.message?.includes('ResizeObserver')) { return e.preventDefault() }
    })

    this.checkConnection()

    // Handle resize events
    window.addEventListener('resize', this.handleResize)
  },

  watch: {
    currentUser (user) {
      // Show welcome dialog to new user
      if (user && !user.checks.welcome && !this.disableWelcome) this.toggleDialog()

      // Update bugsnag session
      if (user) this.updateBugsnag(user)

      // turn on/off contrast mode
      if (this.currentUser.contrastMode) document.querySelector('body').classList.add('contrast-mode')
      else document.querySelector('body').classList.remove('contrast-mode')
    },
    language (language) {
      if (this.lang === language) return
      this.lang = language

      // Only reset the interface when not in LTI
      if (!this.inLTI) this.resetKey++
    },
    school (school) {
      if (school && school.slug) return document.body.classList.add(school.slug + '-styling')
    }
  },

  methods: {
    updateBugsnag (user) {
      if (this.releaseStage === 'local') return
      Bugsnag.setUser(user._id, user.email)
      Bugsnag.addMetadata('school', { name: user.organization.slug, id: user.organization._id })
    },
    checkConnection () {
      this.checkConnectionLoading = true
      clearInterval(this.countdownFunction)

      this.$http.get('status')
        .then(() => { this.serverOnline = true })
        .catch(() => {
          this.serverOnline = false
          this.countdownNumber = 30
          this.countdownFunction = setInterval(() => { this.checkCountdown() }, 1000)
        })
        .finally(() => { this.checkConnectionLoading = false })
    },
    checkCountdown () {
      if (this.countdownNumber > 1) {
        return this.countdownNumber--
      }
      this.checkConnection()
    },
    toggleDialog () {
      this.dialogWelcome = !this.dialogWelcome
      this.disableWelcome = true
    },
    ...mapActions(['handleResize', 'openSidebar', 'closeSidebar', 'setContactForm'])
  },

  computed: {
    ...mapState({
      language: state => state.user.language,
      currentUser: state => state.user,
      school: state => state.school,
      showFooter: state => state.route.meta.footer,
      sidebarOpened: state => state.sidebarOpened,
      contactFormOpened: state => state.contactFormOpened,
      obfuscatorActive: state => state.obfuscatorActive,
      pageOffset: state => state.route.meta.auth,
      showLtiHeader: state => state.user && state.inLTI && (window.self === window.top),
      loadFreshchat: (state) => {
        return state.user && state.school && state.school.enableFreshChat && state.user.role !== 'student'
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
