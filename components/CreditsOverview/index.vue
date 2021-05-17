<template>
  <div>
    <page-cover v-if="inDialog" class="mb-30">
      <!-- Download products results -->
      <page-header :title="$t('SW_CREDITS_INFO')"/>
      {{ $t('SW_CREDITS_REMAINING_INFO', [school.name[lang], appName])}} <a href="#" @click.prevent="contactUs">{{ $t('SW_CONTACT_SUPPORT') }}</a>.
    </page-cover>

    <div v-else>
      {{ $t('SW_CREDITS_REMAINING_INFO', [school.name[lang], appName])}} <a href="#" @click.prevent="contactUs">{{ $t('SW_CONTACT_SUPPORT') }}</a>.
    </div>

    <h3 class="text-center mt-20 bold" v-if="inDialog">
      {{ $t('SW_YOU_HAVE') }} <el-tag type="success" effect="dark">{{ creditsLeft || 0 }}</el-tag> {{ $t('SW_CREDITS').toLowerCase() }}.
    </h3>

    <div v-if="user.credits && user.credits.limit && user.credits.exp">
      <p class="text-center mt-20 mb-10">{{ $t('SW_YOU_HAVE_TO_USE_CREDITS') }}</p>
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
      appName: config.name,
      lang: this.$store.state.lang,
      user: this.$store.state.user,
      school: this.$store.state.user.organization,
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
