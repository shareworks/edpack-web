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
    }
  },

  mounted () {
    window.addEventListener("message", (event) => {
      console.log('addEventListener: ', event.origin)
      console.log('addEventListener: ', event.data)
      event.source.postMessage('OauthInPopupSucceeded', event.origin)
    }, false)
  },

  methods: {
  }
}
</script>

<style lang="scss">
    @import '~scss_vars';
    @import './style.scss';
</style>
