<template>
  <div>
    <el-row type="flex" justify="center" align="middle" class="minimum-page">
      <el-col>
        <!-- Show BG -->
        <div v-if="!inLTI" class="public-background"/>

        <!-- Logo -->
        <router-link to="/" :aria-label="$t('SW_LOGO_IMAGE')">
          <div class="horizontal-logo position-relative"/>
        </router-link>

        <!-- Error title and text -->
        <div class="minimum-container">
          <div class="title text-center">
            <strong>{{ $t('SW_' + errorType.toUpperCase(), [appName]) }}</strong>
          </div>

          <p class="mt-10 text-center">
            {{ $t('SW_' + errorType.toUpperCase() + '_HELP', [appName]) }}
          </p>

          <!-- Cookies blocked warning -->
          <el-alert v-if="errorType === 'lti_error'" type="warning" class="mt-20 text-left" :closable="false">
            <h3 class="text-center mb-10">{{ $t('SW_COOKIE_BLOCKED') }}</h3>
            <p class="mb-10">{{ $t('SW_COOKIE_BLOCKED_INFO') }}</p>
            <ul>
              <li>{{ $t('SW_COOKIE_ALLOW') }}</li>
              <li>{{ $t('SW_USE_ANOTHER_BROWSER') }}</li>
              <li>{{ $t('SW_ENABLE_COOKIE') }}</li>
            </ul>

            <!-- Open 'cookie allow' page in new tab -->
            <div class="text-center mt-20 mb-20">
              <el-button type="success" icon="el-icon-check" size="normal" @click="allowCookies">
                {{ $t('SW_ALLOW_COOKIES') }}
                <i class="icon-arrow_forward"/>
              </el-button>
            </div>
          </el-alert>
        </div>

        <!-- Footer links -->
       <footer-links :signin="true"/>
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
      appName: config.name,
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
