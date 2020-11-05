<template>
  <el-form class="mb-30" id="requestForm" :inline="true" ref="form" name="request" netlify-honeypot="bt-field2" action="thanks-request" netlify>
    <!-- Name of form (hidden) -->
    <input type="hidden" name="form-name" value="request">

    <el-form-item class="email-item">
      <!-- Email -->
      <label for="request-email" class="visually-hidden"></label>
      <el-input class="email-input" id="request-email" prefix-icon="icon-email" type="email" name="email" size="large" v-model="email" :placeholder="$t('SW_YOUR_EMAIL')" @keyup.enter.prevent="submitRequest" :required="true">
        <!--Submit request -->
        <template slot="append">
          <el-button class="submit-button" native-type="submit" type="primary" @click.prevent="submitRequest">
            <i class="icon-send"></i>
            <span class="hidden-xs">{{ $t('SW_REQUEST_ACCESS') }}</span>
          </el-button>
        </template>
      </el-input>
    </el-form-item>

    <!-- Botfield -->
    <el-form-item prop="name" class="hidden">
      <el-input name="bt-field2"></el-input>
    </el-form-item>

  </el-form>
</template>

<script>
import config from 'config'

export default {
  name: 'RequestForm',
  data () {
    return {
      email: ''
    }
  },
  methods: {
    submitRequest () {
      // Basic validation
      if (this.email.indexOf('@') < 0) return this.$message({ message: this.$i18n.t('SW_INCORRECT_EMAIL'), type: 'error' })

      const form = document.forms.namedItem('request')
      const formAction = form.getAttribute('action')
      const formData = new FormData(form)

      // Send to Netlify
      const netlify = this.$http.create({
        baseURL: `${config.web_url}/`,
        timeout: 10000,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })

      netlify.post(formAction, formData)
        .then(() => {
          this.$message({ message: this.$i18n.t('SW_THANKS_REPLY_SOON'), type: 'success' })
          this.email = ''
        })
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
