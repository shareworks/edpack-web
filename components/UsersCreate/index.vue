<template>
  <div>
    <p v-if="!isManageStaff" class="mb-20">{{ $t('SW_ADD_USERS_TEXT') }}</p>
    <p v-else-if="justStudents" class="mb-20">{{ $t('SW_ADD_STUDENTS_TEXT') }}</p>
    <p v-else class="mb-10 bold">{{ $t('SW_INVITE_COACHES') }}</p>

    <el-alert class="mb-10" show-icon v-if="differentDomainWarningVisible" type="warning" :title="$t('SW_DIFFERENT_EMAIL_TITLE')">
      <p>{{ $t("SW_DIFFERENT_EMAIL_TEXT") }}</p>
    </el-alert>

    <el-alert class="mb-10" show-icon v-if="incorrectEmails.length !== 0" type="error" :title="$t('SW_EMAILS_NOT_CORRECT')">
      <ul>
        <li v-for="email in incorrectEmails" :key="email">
          <span class="bold">{{ email }}</span>
        </li>
      </ul>
    </el-alert>

    <el-form label-position="top">
      <!-- Textarea for emails -->
      <el-form-item>
        <el-input :disabled="sending" type="textarea" ref="recipients" :autosize="{ minRows: 3, maxRows: 8}"
                  :placeholder="$t('SW_EMAIL_INVITES_PLACEHOLDER')" v-model="form.recipients"></el-input>
      </el-form-item>
      <!-- Role -->
      <el-form-item v-if="!isManageStaff">
        <el-select v-model="role" class="block">
          <el-option v-for="item in ['staff', 'admin', 'student']" :key="item" :label="$t('SW_' + item.toUpperCase())" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <!-- Send to self -->
      <el-form-item>
        <el-checkbox :label="$t('SW_SEND_TO_SELF')" v-model="form.toSelf" name="type"></el-checkbox>
      </el-form-item>
    </el-form>
    <div class="mt-20">
      <el-button type="primary" @click="addUsers" :loading="sending">
        <i class="icon-send"></i>
        <strong>{{ $t('SW_INVITE') }}</strong>
      </el-button>
      <el-button type="text" class="ml-10" @click="closeDialog()">{{ $t('SW_CANCEL') }}</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UsersCreate',
  props: ['closeDialog', 'isManageStaff', 'justStudents'],

  data () {
    return {
      user: this.$store.state.user,
      school: this.$store.state.school,
      role: 'staff',
      sending: false,
      form: { toSelf: true, recipients: '' },
      differentDomainWarningVisible: false,
      incorrectEmails: []
    }
  },

  mounted () {
    this.$nextTick(() => this?.$refs?.recipients?.focus())
  },

  methods: {
    emailsValidation (emails) {
      let failedEmails = []
      const emailRegex = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/

      // Filter all emails that don't match regex:
      emails.forEach(email => {
        const isIncorrect = !emailRegex.test(email)
        if (isIncorrect) { failedEmails.push(email) }
      })

      failedEmails = failedEmails.filter(email => { return email.trim() !== '' })
      this.incorrectEmails = failedEmails
    },
    addUsers () {
      if (this.sending) return

      const formRecipients = this.form.recipients.trim()

      if (!formRecipients) {
        return this.$message({ message: this.$i18n.t('SW_EMAIL_ERROR'), type: 'warning' })
      }

      // Convert string to emails

      const emails = this.form.recipients.replace(/\n/g, ',').split(',')

      const self = this.form.toSelf

      this.emailsValidation(emails)
      if (this.incorrectEmails.length !== 0) return

      // Optionally check for proper org emails
      if (this.school.emailDomains.length) {
        let missingDomains = false

        emails.forEach(email => {
          const emailDomain = email.replace(/.*@/, '@').trim()
          if (this.school.emailDomains.includes(emailDomain)) return
          missingDomains = true
        })

        // if user use another domain - this warning message will be visible just one time
        if (missingDomains && !this.differentDomainWarningVisible) {
          this.differentDomainWarningVisible = true
          return
        }
      }

      const organization = this.user.organization._id
      const roles = emails.map(email => ({ recipientEmail: email, model: 'organization', contextId: organization, role: this.justStudents ? 'student' : this.role, downgrade: false, sendEmail: true }))

      console.log(roles)

      this.sending = true
      this.$http.post('users/invite', { invitations: roles }, { params: { toSelf: self } })
        .then(() => {
          this.form.recipients = ''
          this.differentDomainWarningVisible = false
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
