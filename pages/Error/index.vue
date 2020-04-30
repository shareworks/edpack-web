<template>
  <div>
    <el-row type="flex" justify="center" align="middle" class="minimum-page">
      <el-col>
        <!-- Show BG -->
        <div v-if="!inLTI" class="public-background"></div>

        <!-- Logo -->
        <div class="text-center">
            <div class="horizontal-logo"></div>
        </div>

        <!-- Error title and text -->
        <div class="minimum-container">
          <div class="title text-center"><strong>{{ $t('SW_' + errorType.toUpperCase()) }}</strong></div>
          <p class="mt-10 text-center">{{ $t('SW_' + errorType.toUpperCase() + '_HELP') }}</p>

          <!-- Cookies blocked warning -->
          <el-alert v-if="errorType === 'lti_error'" type="warning" class="mt-20 text-left" :closable="false">
            <h3 class="text-center mb-10">Cookies blocked?</h3>
            <p class="mb-10">Your browser seems to be blocking a cookie necessary for secure authentication. Possible solutions: </p>
            <ul>
              <li>Allow 'cross-site tracking' or 'third-party cookies' in Preferences > Privacy</li>
              <li>Use another browser</li>
              <li>Enable cookies by clicking the button below</li>
            </ul>

            <!-- Open 'cookie allow' page in new tab -->
            <div class="text-center mt-20 mb-20">
              <el-button type="success" icon="el-icon-check" size="normal" @click="allowCookies">
                {{ $t('SW_ALLOW_COOKIES') }}
                <i class="icon-arrow_forward"></i>
              </el-button>
            </div>
          </el-alert>
        </div>

        <!-- Footer links -->
       <footer-links :signin="true"></footer-links>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import config from 'config'
import FooterLinks from '../../components/FooterLinks'

export default {
  name: 'Error',
  metaInfo: { title: 'Error' },
  components: { FooterLinks },

  data () {
    return {
      webUrl: config.web_url,
      inLTI: this.$store.state.inLTI,
      errorType: this.$route.query.tl || this.$route.query.type || this.$route.query.code || 'UNKNOWN_ERROR'
    }
  },

  methods: {
    allowCookies () {
      const cookiesTab = window.open(`${this.webUrl}/cookie`, '_blank')
      cookiesTab ? cookiesTab.focus() : this.$message({ message: this.$i18n.t('SW_OPEN_NEW_TAB_COOKIE'), type: 'warning' })
    }
  }
}
</script>

<style lang="scss">
    @import '~scss_vars';
    @import './style.scss';
</style>
