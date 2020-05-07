<template>
  <div>
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
            <el-input :placeholder="$t('SW_YOUR_EMAIL')" autofocus prefix-icon="icon-email" class="mb-10" v-model="form.email"></el-input>

            <el-button class="block" :loading="submitting" type="primary" @click="submitEmail">
              <i class="icon-send"></i>
              {{ $t('SW_REQUEST_RESET_LINK') }}
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

export default {
  name: 'Reset',
  metaInfo: { title: 'Reset password' },
  components: { FooterLinks },

  data () {
    return {
      submitting: false,
      form: { email: '' }
    }
  },

  methods: {
    submitEmail () {
      if (!this.form.email || this.submitting) return
      this.submitting = true

      this.$http.post('/auth/local/recover-password', this.form)
        .then((res) => {
          this.$message({ message: this.$i18n.t('SW_EMAIL_RESET_SUBMITTED'), type: 'success' })
        })
        .catch(() => {
          this.$message({ message: this.$i18n.t('SW_EMAIL_NOT_NOT_FOUND'), type: 'error' })
          this.form.email = ''
        })
        .finally(() => { this.submitting = false })
    }
  }
}
</script>

<style lang="scss">
    @import '~scss_vars';
    @import './style.scss';
</style>
