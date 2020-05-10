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
          <div class="title text-center"><strong>{{ $t('SW_RESET_PASSWORD') }}</strong></div>
          <p class="mb-20 text-center">{{ $t('SW_RESET_PASSWORD_TEXT') }}</p>

          <el-form>
            <el-input type="password" :placeholder="$t('SW_YOUR_PASSWORD')" autofocus prefix-icon="icon-password" id="password" v-model="form.password"></el-input>
            <el-input type="password" :placeholder="$t('SW_REPEAT_YOUR_PASSWORD')" prefix-icon="icon-lock" id="reset-password" class="mb-10" v-model="repeatPassword"></el-input>

            <el-button class="block" :loading="submitting" type="primary" @click="submitPassword">
              {{ $t('SW_RESET_SIGN_IN') }}
              <i class="icon-arrow_forward"></i>
            </el-button>
          </el-form>
        </div>

        <!-- Footer links -->
       <footer-links :signin="true"></footer-links>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import FooterLinks from '../../components/FooterLinks'
import AnimatedLanding from '../../../components/AnimatedLanding'

export default {
  name: 'Reset',
  metaInfo: { title: 'Reset password' },
  components: { FooterLinks, AnimatedLanding },

  data () {
    return {
      submitting: false,
      accessToken: this.$route.query.accessToken || '',
      recoverToken: this.$route.query.recoverToken || '',
      organizationId: this.$route.query.organization || '',
      repeatPassword: '',
      form: { password: '' }
    }
  },

  methods: {
    submitPassword () {
      if (!this.form.password || !this.repeatPassword) return this.$message({ message: this.$i18n.t('SW_PASSWORD_INCOMPLETE'), type: 'error' })
      if ((!this.accessToken && !this.recoverToken) || !this.organizationId) return this.$message({ message: this.$i18n.t('SW_MISSING_REGISTER_TOKENS'), type: 'error' })
      if (this.form.password !== this.repeatPassword) {
        this.form.password = ''
        this.repeatPassword = ''
        return this.$message({ message: this.$i18n.t('SW_PASSWORD_MISMATCH'), type: 'error' })
      }

      if (this.submitting) return
      this.submitting = true

      this.$http.post('/auth/local/password', this.form, { params: { accessToken: this.recoverToken, organization: this.organizationId } })
        .then((res) => {
          this.$message({ message: this.$i18n.t('SW_PASSWORD_RESET_SUBMITTED'), type: 'success' })
          this.$router.push('/')
        })
        .catch(() => {
          this.$message({ message: this.$i18n.t('SW_ALREADY_RESET'), type: 'error' })
        })
        .finally(() => {
          this.form.email = ''
          this.submitting = false
        })
    }
  }
}
</script>

<style lang="scss">
    @import '~scss_vars';
    @import './style.scss';
</style>
