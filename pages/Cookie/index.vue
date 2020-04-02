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

        <!-- Explain cookie status -->
        <div class="minimum-container">
          <p class="title"><strong>{{ $t('SW_COOKIES_TITLE') }}</strong></p>

          <el-alert v-if="loading === 'pending'" :title="$t('SW_COOKIES_LOADING')" :center="true" :closable="false" type="info" class="mt-20 message-text">
            <p>{{ $t('SW_COOKIES_CHECKING_TEXT') }}</p>
            <spinner class="mb-20"></spinner>
          </el-alert>

          <el-alert v-if="loading === 'checking'" :title="$t('SW_COOKIES_CHECKING')" :center="true" :closable="false" type="info" class="mt-20 message-text">
            <p>{{ $t('SW_COOKIES_CHECKING_TEXT') }}</p>
            <spinner class="mb-20"></spinner>
          </el-alert>

          <el-alert v-if="loading === 'done'" :title="$t('SW_COOKIES_WORKING')" :center="true" :closable="false" type="success" class="mt-20 message-text">
            <p class="mb-20">{{ $t('SW_COOKIES_WORKING_TEXT') }}</p>
          </el-alert>

          <el-alert v-if="loading === 'failed'" :title="$t('SW_COOKIES_FAILED')" :center="true" :closable="false" type="error" class="mt-20 message-text">
            <p class="mb-20">{{ $t('SW_COOKIES_FAILED_TEXT') }}</p>
          </el-alert>
        </div>

        <!-- Footer links -->
        <footer-links></footer-links>

      </el-col>
    </el-row>
  </div>
</template>

<script>
import FooterLinks from '../../components/FooterLinks'

export default {
  name: 'Cookie',
  metaInfo: { title: 'Accept cookie' },
  components: { FooterLinks },

  data () {
    return {
      loading: 'pending',
      inLTI: this.$store.state.inLTI
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
