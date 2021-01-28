<template>
  <div id="app" :class="currentUser.contrastMode ? 'contrast-mode' : ''">
    <vue-progress-bar/>
    <app-sidebar v-if="navAvailable" :closeSidebar="closeSidebar" :active="sidebarOpened" />
    <app-header v-if="navAvailable" :openSidebar="openSidebar"/>

    <!-- Main content -->
    <main :class="{ 'page-offset': pageOffset, 'nav-offset': navAvailable, 'page-lti': inLTI }">
      <el-alert type="error" class="no-border-radius text-center" effect="dark" show-icon :closable="false" :title="$t('SW_SERVER_MAINTENANCE', [appName])" v-if="!serverOnline"/>
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
    <el-dialog custom-class="welcome-dialog" :class="currentUser.contrastMode ? 'contrast-mode' : ''" append-to-body :visible.sync="dialogWelcome">
      <welcome-dialog :closeDialog="toggleDialog"/>
    </el-dialog>

    <!-- Contact dialog -->
    <el-dialog :title="$t('SW_CONTACT_US')" append-to-body :visible="contactFormOpened" @close="setContactForm">
      <contact-form v-if="contactFormOpened" :closeDialog="setContactForm"/>
    </el-dialog>
  </div>
</template>

<script>
import config from 'config'
import { mapActions, mapState } from 'vuex'
import Bugsnag from '../../plugins/bugsnag'
import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
import AppSidebar from '../../components/AppSidebar'
import browserConfig from '../../utils/browser-update'
import WelcomeDialog from '../../components/WelcomeDialog'
import ReloadAfterDeploy from '../../components/ReloadAfterDeploy'
import ContactForm from '../../components/ContactForm'

export default {
  name: 'App',
  metaInfo: {
    title: 'Welcome',
    titleTemplate: '%s - ' + config.name + ' ' + config.releaseStage.toUpperCase()
  },
  components: {
    ContactForm, WelcomeDialog, AppHeader, AppSidebar, AppFooter, ReloadAfterDeploy, Freshchat: () => import('../../components/Freshchat')
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
  },

  mounted () {
    this.checkConnection()

    // Handle resize events
    window.addEventListener('resize', this.handleResize)
  },

  updated () {
    if (this.currentUser?._id) Bugsnag.setUser(this.currentUser._id)
    if (this.school._id) Bugsnag.setContext(this.school._id)
  },

  watch: {
    currentUser (user) {
      // Show welcome dialog to new user
      if (user && !user.checks.welcome && !this.disableWelcome) this.toggleDialog()
    },
    language (language) {
      if (this.lang === language) return
      this.resetKey++
      this.lang = language
    },
    school (school) {
      if (school && school.slug) return document.body.classList.add(school.slug + '-styling')
    }
  },

  methods: {
    checkConnection () {
      this.$http.get('status')
        .then(() => { this.serverOnline = true })
        .catch(() => { this.serverOnline = false })
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
