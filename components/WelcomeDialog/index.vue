<template>
  <div class="welcome-dialog">
    <div class="dialog-logo">
      <logo-animation></logo-animation>
    </div>

    <!-- About project -->
    <section v-if="steps[step] === 'intro'">
      <h3 class="mb-20 font-18">
        {{ $t('SW_WELCOME_ABOUT') }}

        <a href @click="openAbout">
          <strong>{{ $t('SW_LEARN_MORE') }}</strong>
        </a>
      </h3>

      <p class="mb-20">{{ $t('SW_WELCOME_TEXT', [school.name[lang]]) }}
        <span v-if="showChatLink">{{ $t('SW_WELCOME_TEXT1') }} <a href @click="openChat">{{ $t('SW_WELCOME_TEXT2') }}</a></span>
        <span v-else>{{ $t('SW_WELCOME_TEXT3') }}</span>.
      </p>
      <p class="mb-30">{{ $t('SW_GOOD_LUCK') }}</p>
    </section>

    <!-- Accept terms and privacy statement -->
    <section v-else-if="steps[step] === 'terms'">
      <h3 class="font-18 mb-20">{{ $t('SW_READ_TERMS', [school.name[lang]]) }}</h3>

      <el-card shadow="never" class="mb-20">
        <div class="terms-window">
          <div v-if="school.colofon && school.colofon[lang]" v-html="school.colofon[lang]"></div>
        </div>
      </el-card>
    </section>

    <!-- Fill student name and avatar -->
    <section v-else-if="steps[step] === 'verify'" class="mb-30">
      <h3 class="mb-20 font-18">{{ $t('SW_ADD_NAME_IMAGE') }}</h3>
      <p class="mb-20">{{ $t('SW_ADD_NAME_TEXT') }}</p>
      <el-form ref="form" :model="form" label-width="150px" class="text-left">
        <!-- Thumbnail -->
        <el-form-item :label="$t('SW_YOUR_PHOTO')">
          <thumbnail-edit :form="form"></thumbnail-edit>
        </el-form-item>

        <!-- Full name -->
        <el-form-item :label="$t('SW_YOUR_NAME')" required>
          <el-input prefix-icon="icon-bio" v-model="form.name"></el-input>
        </el-form-item>
      </el-form>
    </section>

    <app-language v-if="steps[step] === 'intro'" class="mr-10" :big="true"></app-language>
    <el-button class="mr-5" v-else @click="step--">
      <i class="icon-arrow_back"></i>
      {{ $t('SW_BACK') }}
    </el-button>
    <el-button type="primary" @click="nextStep" :loading="submitting">
      <strong v-if="steps[step] === 'intro'">{{ $t('SW_CONTINUE') }}</strong>
      <strong v-else-if="steps[step] === 'terms'">{{ $t('SW_ACCEPT_CLOSE') }}</strong>
      <strong v-else-if="steps[step] === 'verify'">{{ $t('SW_SAVE_CLOSE') }}</strong>
      <i class="ml-5 icon-arrow_forward"></i>
    </el-button>
    <el-checkbox class="ml-10" v-model="dontShowAgain">{{ $t('SW_DONT_SHOW_AGAIN') }}</el-checkbox>
  </div>
</template>

<script>
import Vue from 'vue'
import config from 'config'
const LogoAnimation = () => import('../../../../public/images/logo-animation.svg')
import ThumbnailEdit from '../../components/ThumbnailEdit'

export default {
  name: 'WelcomeDialog',
  props: ['closeDialog'],
  components: { LogoAnimation, ThumbnailEdit },

  data () {
    return {
      step: 0,
      steps: ['intro'],
      showChatLink: this?.school?.role !== 'student' && this.$store.state.school.enableFreshChat,
      school: this.$store.state.school,
      currentUser: this.$store.state.user,
      lang: this.$store.state.lang,
      submitting: false,
      dontShowAgain: false,
      acceptTerms: !!(this.$store.state.school.colofon && this.$store.state.school.colofon[this.$store.state.lang]),
      form: Vue.util.extend({}, this.$store.state.user),
      verifyAccountInfo: config.verifyAccountInfo
    }
  },

  created () {
    if (this.acceptTerms) this.steps.push('terms')
    if (this.verifyAccountInfo) this.steps.push('verify')
  },

  methods: {
    nextStep () {
      if (this.step === this.steps.length - 1) return this.closeDialog()
      this.step++
    },
    openAbout (e) {
      e.preventDefault()
      window.open('/about')
    },
    openChat (e) {
      e.preventDefault()
      window.fcWidget.open()
    },
    updateUser () {
      this.submitting = true
      this.$store.state.user.checks.welcome = true
      this.$http.put(`users/${this.currentUser._id}`, { checks: this.$store.state.user.checks })
        .then(() => { this.closeDialog() })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.submitting = false })
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
  @import '../../../../src/styles/logo-animation.scss';
</style>
