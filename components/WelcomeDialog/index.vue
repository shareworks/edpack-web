<template>
  <div class="welcome-dialog">
    <div class="dialog-logo">
      <logo-animation></logo-animation>
    </div>

    <!-- About Eduapp -->
    <section v-if="step === 0">
      <h3 class="mb-20 font-18">
        {{ $t('SW_WELCOME_ABOUT') }}

        <a href @click="openAbout">
          <strong>{{ $t('SW_LEARN_MORE') }}</strong>
        </a>
      </h3>

      <p class="mb-20">{{ $t('SW_WELCOME_TEXT', [this.school.name[lang]]) }}
        <span v-if="showChatLink">{{ $t('SW_WELCOME_TEXT1') }} <a href @click="openChat">{{ $t('SW_WELCOME_TEXT2') }}</a></span>
        <span v-else>{{ $t('SW_WELCOME_TEXT3') }}</span>.
      </p>
      <p class="mb-30">{{ $t('SW_GOOD_LUCK') }}</p>
    </section>

    <!-- Accept terms and privacy statement -->
    <section v-else-if="step === 1">
      <p class="mb-20">{{ $t('SW_READ_TERMS', [this.school.name[lang]]) }}</p>

      <el-card shadow="never" class="mb-20">
        <div class="terms-window">
          <div v-if="school.colofon && school.colofon[lang]" v-html="school.colofon[lang]"></div>
        </div>
      </el-card>
    </section>

    <app-language class="mr-10" :big="true"></app-language>

    <el-button type="primary" @click="nextStep" :loading="submitting">
      <strong v-if="step === 0">
        {{ $t('SW_CONTINUE') }}
        <i class="icon-arrow_forward"></i>
      </strong>
      <strong v-if="step === 1">
        <i class="icon-checkmark"></i>
        {{ $t('SW_ACCEPT_CLOSE') }}
      </strong>
    </el-button>
    <el-checkbox class="ml-10" v-model="dontShowAgain">{{ $t('SW_DONT_SHOW_AGAIN') }}</el-checkbox>
  </div>
</template>

<script>
const LogoAnimation = () => import('../../../../public/images/logo-animation.svg')

export default {
  name: 'WelcomeDialog',
  props: ['closeDialog'],
  components: { LogoAnimation },

  data () {
    return {
      step: 0,
      showChatLink: this?.school?.role !== 'student' && this.$store.state.school.enableFreshChat,
      school: this.$store.state.school,
      currentUser: this.$store.state.user,
      lang: this.$store.state.lang,
      submitting: false,
      dontShowAgain: !!(this.$store.state.school.colofon && this.$store.state.school.colofon[this.$store.state.lang])
    }
  },

  methods: {
    openAbout (e) {
      e.preventDefault()
      window.open('/about')
    },
    openChat (e) {
      e.preventDefault()
      window.fcWidget.open()
    },
    nextStep () {
      if (this.submitting) return
      if (this.step === 0 && this.school.colofon[this.lang]) return this.step++

      if (!this.dontShowAgain) return this.closeDialog()

      // Update user
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
