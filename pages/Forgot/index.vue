<template>
  <div>
    <animated-landing class="animated"></animated-landing>
    <el-row type="flex" justify="center" align="middle" class="minimum-page">
      <el-col>
        <!-- Show BG -->
        <div class="public-background"></div>

        <!-- Logo -->
        <div class="text-center">
            <div class="horizontal-logo"></div>
        </div>

        <!-- Reset form -->
        <div class="minimum-container">
          <div class="title text-center"><strong>{{ $t(requestPassword ? 'SW_REQUEST_PASSWORD' : 'SW_FORGOT_PASSWORD') }}</strong></div>

          <el-collapse-transition>
            <div v-show="!success">
              <p class="mb-20 text-center">{{ $t('SW_FORGOT_PASSWORD_TEXT', [appName]) }}</p>

              <el-form :model="form" @submit.prevent.native="submitEmail">
                <el-input :placeholder="$t('SW_YOUR_EMAIL')" autofocus prefix-icon="icon-email" class="mb-10" v-model="form.email"></el-input>

                <el-button class="block" :loading="submitting" type="primary" @click="submitEmail">
                  <i class="icon-send"></i>
                  {{ $t('SW_REQUEST_RESET_LINK') }}
                </el-button>
              </el-form>
            </div>
          </el-collapse-transition>

          <el-collapse-transition>
            <div v-show="success" class="text-center pa-3">
              <i class="icon-checkmark mb-2 font-32 text-success"></i>
              <p class="title">{{ $t('SW_MESSAGE_SENT') }}</p>
            </div>
          </el-collapse-transition>
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
import AnimatedLanding from '../../../components/AnimatedLanding'

export default {
  name: 'Reset',
  metaInfo: { title: 'Forgot password' },
  components: { FooterLinks, AnimatedLanding },

  data () {
    return {
      submitting: false,
      success: false,
      appName: config.name,
      form: { email: this.$route.query.email || '' },
      requestPassword: this.$route.query.requestPassword || false
    }
  },

  methods: {
    submitEmail () {
      if (!this.form.email || this.submitting) return
      this.submitting = true

      this.$http.post('/auth/local/recover-password', this.form)
        .then(() => {
          this.success = true
          this.$message({ message: this.$i18n.t('SW_EMAIL_RESET_SUBMITTED'), type: 'success' })
        })
        .catch(() => { this.$message({ message: this.$i18n.t('SW_EMAIL_NOT_NOT_FOUND'), type: 'error' }) })
        .finally(() => { this.submitting = false })
    }
  }
}
</script>

<style lang="scss">
    @import '~scss_vars';
    @import './style.scss';
</style>
