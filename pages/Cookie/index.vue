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

        <!-- Explain cookie status -->
        <div class="minimum-container">
          <p class="title">
            <strong>{{ $t('SW_COOKIES_TITLE') }}</strong>
          </p>

          <el-alert v-for="cookie in cookies" :key="cookie.status" v-show="loading === cookie.status" :title="$t(cookie.title)"
                    :center="true" :closable="false" :type="cookie.type" class="mt-20 message-text">
            <p class="mb-20">{{ $t(cookie.paragraph, [appName]) }}</p>
          </el-alert>
        </div>

        <!-- Footer links -->
        <footer-links/>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import config from 'config'
import FooterLinks from '../../components/FooterLinks'

export default {
  name: 'Cookie',
  metaInfo: { title: 'Accept cookie' },
  components: { FooterLinks },

  data () {
    return {
      loading: 'pending',
      appName: config.name,
      inLTI: this.$store.state.inLTI,
      cookies: [
        { status: 'pending', title: 'SW_COOKIES_LOADING', paragraph: 'SW_COOKIES_CHECKING_TEXT', type: 'info' },
        { status: 'checking', title: 'SW_COOKIES_CHECKING', paragraph: 'SW_COOKIES_CHECKING_TEXT', type: 'info' },
        { status: 'done', title: 'SW_COOKIES_WORKING', paragraph: 'SW_COOKIES_WORKING_TEXT', type: 'success' },
        { status: 'failed', title: 'SW_COOKIES_FAILED', paragraph: 'SW_COOKIES_FAILED_TEXT', type: 'error' }
      ]
    }
  },

  mounted () {
    this.getCookie()
  },

  methods: {
    getCookie () {
      this.$http.get('/cookies/allow')
        .then(res => {
          if (!res.data || !res.data.cookieStatus) this.loading = 'failed'
          if (res.data.cookieStatus === 'allowed') {
            this.loading = 'checking'
            this.checkCookie()
          } else this.loading = 'failed'
        })
        .catch(() => { this.loading = 'failed' })
    },
    checkCookie () {
      this.$http.get('/cookies/check')
        .then(res => {
          if (!res.data || !res.data.cookieStatus) this.loading = 'failed'
          this.loading = res.data.cookieStatus === 'accepted' ? 'done' : 'failed'
        })
        .catch(() => { this.loading = 'failed' })
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
