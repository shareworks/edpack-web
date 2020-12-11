<template>
  <div>
    <page-cover>
      <div class="dialog-logo">
        <section class="logo-wrapper">
          <!-- Logo animation -->
          <logo-animation/>
        </section>

        <!-- Headers -->
        <h3 class="mb-20 font-18 max-600">
          <div v-if="step === 0">
            <p>{{ $t('SW_WELCOME_ABOUT') }}</p>

            <a v-if="aboutUrl" :href="aboutUrl" target="_blank">
              <strong>{{ $t('SW_LEARN_MORE') }}</strong>
            </a>
            <router-link v-else to="/about" target="_blank" class="inline">
              <strong>{{ $t('SW_LEARN_MORE') }}</strong>
            </router-link>
          </div>
          <p v-else-if="steps[step] === 'verify'">{{ $t('SW_ADD_NAME_IMAGE') }}</p>
          <p v-else-if="steps[step] === 'terms'">{{ $t('SW_READ_TERMS', [school.name[lang]]) }}</p>
        </h3>
      </div>
    </page-cover>

    <div class="page-body max-600 welcome-body">

      <!-- About project -->
      <section v-if="steps[step] === 'intro'">
        <p class="mb-20 font-16">{{ $t('SW_WELCOME_TEXT', [school.name[lang]]) }}
          <span v-if="showChatLink">{{ $t('SW_WELCOME_TEXT1') }} <a href="#" @click.prevent="openChat">{{ $t('SW_WELCOME_TEXT2') }}</a></span>
          <span v-else>{{ $t('SW_WELCOME_TEXT3') }}</span>.
        </p>
        <p class="font-16">{{ $t('SW_GOOD_LUCK') }}</p>

        <!-- Contrast mode -->
        <el-form class="mt-20 mb-30 ">
          <el-form-item>
            <el-switch v-model="currentUser.contrastMode" active-color="#13ce66" inactive-color="#ff4949"/>
            <span class="ml-10">{{ $t('SW_CONTRAST_MODE_SHORT') }}</span>
          </el-form-item>
        </el-form>
      </section>

      <!-- Accept terms and privacy statement -->
      <section v-else-if="steps[step] === 'terms'">
        <el-card shadow="never" class="mb-20">
          <div class="terms-window">
            <div v-if="!acceptTermsOnWelcome" v-html="school.colofon[lang]"/>
            <static-terms v-else/>
          </div>
        </el-card>
      </section>

      <!-- Fill student name and avatar -->
      <section v-else-if="steps[step] === 'verify'" class="mb-30">
        <p class="mb-20">{{ $t('SW_ADD_NAME_TEXT') }}</p>
        <el-form ref="form" :model="form" label-width="150px" class="text-left">

          <!-- Thumbnail -->
          <el-form-item :label="$t('SW_YOUR_PHOTO')">
            <thumbnail-edit :form="form"/>
          </el-form-item>

          <!-- Full name -->
          <el-form-item :label="$t('SW_YOUR_NAME')" required>
            <el-input prefix-icon="icon-bio" v-model="form.name"/>
          </el-form-item>
        </el-form>
      </section>

      <!-- App language -->
      <app-language v-if="steps[step] === 'intro'" class="mr-10" :big="true"/>

      <!-- Go back button -->
      <el-button class="mr-5" v-else @click="step--">
        <i class="icon-arrow_back"></i>
        {{ $t('SW_BACK') }}
      </el-button>

      <!-- Welcome dialog steps controls button -->
      <el-button type="primary" @click="nextStep" :loading="submitting">
        <strong v-if="steps[step] === 'intro'">{{ $t('SW_CONTINUE') }}</strong>
        <strong v-else-if="steps[step] === 'terms' || acceptTermsOnWelcome">{{ $t('SW_ACCEPT_CLOSE') }}</strong>
        <strong v-else-if="steps[step] === 'verify'">{{ $t('SW_SAVE_CLOSE') }}</strong>
        <i class="ml-5 icon-arrow_forward"></i>
      </el-button>

      <!-- Don't show again -->
      <el-checkbox class="ml-10" v-model="dontShowAgain">{{ $t('SW_DONT_SHOW_AGAIN') }}</el-checkbox>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import config from 'config'
import StaticTerms from '../../../pages/StaticTerms'
import ThumbnailEdit from '../../components/ThumbnailEdit'
const LogoAnimation = () => import('../../../../public/images/logo-animation.svg')

export default {
  name: 'WelcomeDialog',
  props: ['closeDialog'],
  components: { LogoAnimation, ThumbnailEdit, StaticTerms },

  data () {
    const acceptTermsOnWelcome = config.acceptTermsOnWelcome
    const acceptTerms = !!(this.$store.state.school.colofon && this.$store.state.school.colofon[this.$store.state.lang]) || acceptTermsOnWelcome

    return {
      aboutUrl: config.aboutUrl,
      acceptTermsOnWelcome,
      acceptTerms,
      school: this.$store.state.school,
      step: 0,
      steps: ['intro'],
      showChatLink: this?.school?.role !== 'student' && this.$store.state.school.enableFreshChat,
      currentUser: this.$store.state.user,
      lang: this.$store.state.lang,
      submitting: false,
      dontShowAgain: false,
      form: Vue.util.extend({}, this.$store.state.user),
      verifyAccountInfo: config.verifyAccountInfo
    }
  },

  created () {
    if (this.acceptTerms && !this.currentUser.checks.acceptedTerms) this.steps.push('terms')
    if (this.verifyAccountInfo && !this.currentUser.checks.verifiedAccount) this.steps.push('verify')
  },

  methods: {
    nextStep () {
      // If only intro and no check on dont show again, just close
      if (this.step === 0 && this.steps.length === 1 && !this.dontShowAgain) {
        this.updateUser()
      }

      // If more then intro, just continue to next one
      if (this.step === 0 && this.steps.length > 1) return this.step++

      // If passed intro, always update user
      else this.updateUser()
    },
    updateUser () {
      if (this.submitting) return
      this.submitting = true

      // Add checks when they apply
      this.form.checks.verifiedAccount = this.steps[this.step] === 'verify'
      this.form.checks.acceptedTerms = this.acceptTerms
      this.form.checks.welcome = this.dontShowAgain
      this.form.contrastMode = this.currentUser.contrastMode

      const params = { params: { entity: this.school._id } }

      this.$http.put(`users/${this.currentUser._id}`, this.form, params)
        .then(() => {
          const user = this.$store.state.user

          // Update current user
          user.name = this.form.name
          user.thumbnailUrl = this.form.thumbnailUrl
          this.$store.dispatch('setUser', user)

          // Close dialog or continue
          if (this.steps.length !== this.step + 1) this.step++
          this.closeDialog()
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.submitting = false })
    },
    openChat () { window.fcWidget.open() }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
  @import '../../../../src/styles/logo-animation.scss';
</style>
