<template>
    <el-form>
      <el-input @keyup.enter.native="submitPassword" type="password" :placeholder="$t('SW_YOUR_PASSWORD', [appName])" autofocus prefix-icon="icon-password" id="password" v-model="form.password"/>
      <password v-model="form.password" :strengthMeterOnly="true"/>
      <el-input @keyup.enter.native="submitPassword" type="password" :placeholder="$t('SW_REPEAT_YOUR_PASSWORD')" prefix-icon="icon-lock" id="reset-password" class="mb-10" v-model="repeatPassword"/>

      <el-button class="block" :loading="submitting" type="primary" @click="submitPassword">
        {{ $t('SW_RESET_SIGN_IN') }}
        <i class="icon-arrow_forward"/>
      </el-button>
    </el-form>
</template>

<script>
import config from 'config'
import Password from 'vue-password-strength-meter'
import showErrorMessage from '@/edpack-web/utils/show-error-message'

export default {
  name: 'ResetForm',
  components: { Password },
  data () {
    return {
      appName: config.name,
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
        .then(() => {
          this.$message({ message: this.$i18n.t('SW_PASSWORD_RESET_SUBMITTED'), type: 'success' })
          this.$router.push('/')
        })
        .catch((err) => {
          showErrorMessage(this, err)
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
