<template>
  <div>
    <el-row type="flex" justify="center" align="middle" class="minimum-page">
      <el-col>
        <!-- Show BG -->
        <div class="public-background"/>

        <!-- Logo -->
        <router-link to="/" :aria-label="$t('SW_LOGO_IMAGE')">
          <div class="horizontal-logo position-relative"/>
        </router-link>

        <!-- Error title and text -->
        <div class="minimum-container">
          <div class="title text-center">
            <strong>{{ $t('SW_OAUTH_SUCCEEDED') }}</strong>
          </div>

          <p class="mt-10 text-center">
            {{ $t('SW_SW_OAUTH_SUCCEEDED_TEXT') }}
          </p>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import config from 'config'
export default {
  name: 'OauthSucceeded',
  metaInfo: { title: 'OauthSucceeded' },
  components: {},

  data () {
    return {
      passedSucceeded: false
    }
  },

  mounted () {
    const self = this

    const eventHandler = (event) => {
      // If postMessage already send, stop her
      if (self.passedSucceeded) return

      // Wait till receive message from parent
      if (event.origin !== config.web_url) return

      // Skip all messages not for the popup
      if (event.data !== 'checkIfOauthFlowSucceeded') return

      // Keep track that we postMessage already=
      self.passedSucceeded = true

      // Send message back that oauth is succeeded
      event.source.postMessage('OauthInPopupSucceeded', event.origin)

      // Remove eventListener
      window.removeEventListener('message', eventHandler, false)

      // close this windows after 2 seconds
      setTimeout(function () { window.close() }, 2000)
    }

    window.addEventListener('message', eventHandler, false)

    // Always close this windows after 8 seconds
    setTimeout(function () { window.close() }, 8000)
  },

  methods: {
  }
}
</script>

<style lang="scss">
    @import '~scss_vars';
    @import './style.scss';
</style>
