<template>
  <div class="text-center mt-30">

    <!-- Built by -->
    <p class="mb-20">
      &copy; {{ (new Date()).getFullYear() }} &centerdot; {{ $t('SW_BUILT_BY') }}
      <a :href="businessUrl" rel="noreferrer" target="_blank">{{ businessName }}</a>.
    </p>

    <!-- Read our terms & policy -->
    {{ $t('SW_READ_OUR') }}
    <router-link to="/terms">{{ $t('SW_TERMS').toLowerCase() }}</router-link> & <router-link to="/privacy">{{ $t('SW_PRIVACY').toLowerCase() }}</router-link>.

  </div>
</template>

<script>
import config from 'config'

export default {
  name: 'FooterCredits',

  data () {
    return {
      appName: config.name,
      supportMail: config.supportMail,
      businessUrl: config.business.url,
      businessName: config.business.shortName
    }
  }
}
</script>

<style lang="scss">
</style>
