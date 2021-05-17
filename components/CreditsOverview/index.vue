<template>
  <div>
    {{ $t('SW_CREDITS_REMAINING_INFO', [school.name[lang], appName])}} <a href="#" @click.prevent="contactUs">{{ $t('SW_CONTACT_SUPPORT') }}</a>.

    <h3 class="text-center mt-20 bold" v-if="inDialog">
      You currently have <el-tag type="success" effect="dark">{{ creditsLeft || 0 }}</el-tag> credits.
    </h3>
    <div v-if="user.credits && user.credits.limit && user.credits.exp">
      <p class="text-center mt-20 mb-10">You have to use these credits before:</p>
      <h4 class="text-center bold">
        <i class="hidden-xs hidden-sm icon-time"/>
        {{ prettyDate(user.credits.exp) }}
      </h4>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import config from 'config'

export default {
  name: 'CreditsOverview',
  props: ['inDialog'],

  data () {
    return {
      school: this.$store.state.user.organization,
      appName: config.name,
      lang: this.$store.state.lang,
      user: this.$store.state.user,
      creditsLeft: this.$store.state.user.credits.limit - this.$store.state.user.credits.used
    }
  },

  methods: {
    prettyDate (date) { return moment(new Date(date)).format('LLL') },
    contactUs () {
      if (window.fcWidget) return window.fcWidget.open()
      this.$store.dispatch('setContactForm', true)
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
