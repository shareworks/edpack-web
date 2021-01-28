<template>
  <div>
    {{ $t('SW_CREDITS_REMAINING_INFO', [school.name[lang], appName])}} <a href="#" @click.prevent="contactUs">{{ $t('SW_CONTACT_SUPPORT') }}</a>.

    <div v-if="user.credits && user.credits.exp">
      <strong class="hidden-xs hidden-sm"><i class="icon-time"/></strong>
      <strong>{{ prettyDate(user.credits.exp) }}</strong>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import config from 'config'

export default {
  name: 'CreditsOverview',

  data () {
    return {
      school: this.$store.state.user.organization,
      appName: config.name,
      lang: this.$store.state.lang,
      user: this.$store.state.user
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
