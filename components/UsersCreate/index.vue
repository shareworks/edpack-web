<template>
  <div>
    <p class="mb-20">{{ $t('SW_ADD_USERS_TEXT') }}</p>

    <el-alert class="mb-10" show-icon v-if="warningVisible" type="warning" :title="$t('SW_DIFFERENT_EMAIL_TITLE')">
      <p>{{ $t("SW_DIFFERENT_EMAIL_TEXT") }}</p>
    </el-alert>

    <el-form label-position="top">
      <el-form-item>
        <el-input :disabled="sending" type="textarea" ref="recipients" autofocus :autosize="{ minRows: 3, maxRows: 8}" :placeholder="$t('SW_EMAIL_INVITES_PLACEHOLDER')" v-model="form.recipients">
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-checkbox :label="$t('SW_SEND_TO_SELF')" v-model="form.toSelf" name="type"></el-checkbox>
      </el-form-item>
    </el-form>
    <div class="mt-20">
      <el-button type="primary" @click="addUsers" :loading="sending">
        <i class="icon-send"></i>
        <strong>{{ $t('SW_INVITE') }}</strong>
      </el-button>
      <el-button type="text" class="ml-10" @click="closeDialog(false)">{{ $t('SW_CANCEL') }}</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UsersCreate',
  props: ['closeDialog'],

  data () {
    return {
      user: this.$store.state.user,
      school: this.$store.state.school,
      sending: false,
      form: { toSelf: true, recipients: '' },
      warningVisible: false
    }
  },

  mounted () {
    this.$nextTick(() => this.$refs.recipients.focus())
  },

  methods: {
    addUsers () {
      if (this.sending) return

      // Convert string to emails
      let emails = this.form.recipients.replace(/\n/g, ',').split(',')
      emails = emails.map(email => email.trim())
      const self = this.form.toSelf

      // Filter all emails that don't have a @:
      emails = emails.filter(email => email.includes('@'))

      // Do something when no emails given
      if (!emails.length) return

      // Optionally check for proper org emails
      if (this.school.emailDomains.length) {
        let missingDomains = false

        emails.forEach(email => {
          const emailDomain = email.replace(/.*@/, '@').trim()
          if (this.school.emailDomains.includes(emailDomain)) return
          missingDomains = true
        })

        // if user use another domain - this warning message will be visible just one time
        if (missingDomains && !this.warningVisible) {
          this.warningVisible = true
          return
        }
      }

      const organization = this.user.organization._id
      const roles = emails.map(email => ({ email, model: 'organization', id: organization, role: 'staff' }))

      this.sending = true
      this.$http.post('users/invite', { roles }, { params: { toSelf: self } })
        .then(() => {
          this.form.recipients = ''
          this.warningVisible = false
          this.$message({ message: this.$i18n.t('SW_EMAILS_SENT'), type: 'success' })
          this.closeDialog(true)
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.sending = false })
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
