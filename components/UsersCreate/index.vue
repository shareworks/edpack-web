<template>
  <div>
    <p v-if="!isManageStaff" class="mb-20">{{ $t('SW_ADD_USERS_TEXT') }}</p>
    <p v-else-if="justStudents" class="mb-20">{{ $t('SW_ADD_STUDENTS_TEXT') }}</p>
    <p v-else class="mb-10 bold">{{ $t('SW_INVITE_COACHES') }}</p>

    <el-alert class="mb-10" show-icon v-if="showDomainWarning" type="warning" :title="$t('SW_DIFFERENT_EMAIL_TITLE')">
      <p>{{ $t("SW_DIFFERENT_EMAIL_TEXT") }}</p>
    </el-alert>

    <el-alert class="mb-10" show-icon v-if="incorrectEmails.length" type="error" :title="$t('SW_EMAILS_NOT_CORRECT')">
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
                  :placeholder="$t('SW_EMAIL_INVITES_PLACEHOLDER')" v-model="form.recipients"/>
      </el-form-item>

      <!-- Role -->
      <el-form-item v-if="!isManageStaff" class="role-select">
        <el-select v-model="role" class="block">
          <el-option v-for="item in ['staff', 'admin', 'student']" :key="item" :label="$tc('SW_' + item.toUpperCase(), 1)" :value="item"/>
        </el-select>
      </el-form-item>

      <!-- Send to self -->
      <el-form-item class="send-copy" v-if="!assessmentUrl">
        <el-checkbox :label="$t('SW_SEND_TO_SELF')" v-model="form.toSelf" name="type"/>
      </el-form-item>
    </el-form>

    <div class="mt-20">
      <!-- Add user -->
      <el-button type="primary" @click="addUsers" :loading="sending">
        <i class="icon-send"></i>
        <strong>{{ $t('SW_INVITE') }}</strong>
      </el-button>

      <!-- Cancel -->
      <el-button type="text" class="ml-10" @click="closeDialog()">{{ $t('SW_CANCEL') }}</el-button>
    </div>
  </div>
</template>

<script>
import emailsValidation from '@/edpack-web/utils/emails-validation'
export default {
  name: 'UsersCreate',
  props: ['closeDialog', 'isManageStaff', 'justStudents', 'course', 'assessmentUrl', 'assessmentRole'],

  data () {
    return {
      user: this.$store.state.user,
      school: this.$store.state.school,
      role: 'staff',
      sending: false,
      form: { toSelf: true, recipients: '' },
      showDomainWarning: false,
      incorrectEmails: []
    }
  },

  mounted () {
    this.$nextTick(() => this?.$refs?.recipients?.focus())
  },

  methods: {
    emailsValidation (emails) {
      let failedEmails = []

      // Filter all emails that don't match regex:
      emails.forEach(email => { emailsValidation(email, failedEmails, [], email, email) })

      failedEmails = failedEmails.filter(email => email.trim())
      this.incorrectEmails = failedEmails
    },
    addUsers () {
      if (this.sending) return

      const formRecipients = this.form.recipients.trim()

      if (!formRecipients) return this.$message({ message: this.$i18n.t('SW_EMAIL_ERROR'), type: 'warning' })

      // Convert string to emails
      const emails = this.form.recipients.replace(/\n/g, ',').split(',')

      const self = this.form.toSelf

      this.emailsValidation(emails)
      if (this.incorrectEmails.length) return

      // Check for proper org emails
      if (this.school.emailDomains.length) {
        let invalidDomains = false

        emails.forEach(email => {
          const emailDomain = email.replace(/.*@/, '@').trim()
          if (this.school.emailDomains.includes(emailDomain)) return
          invalidDomains = true
        })

        // if non-org domains is used, show warning message one time
        if (invalidDomains && !this.showDomainWarning) {
          this.showDomainWarning = true
          return
        }
      }

      this.sending = true

      if (this.assessmentUrl) {
        // PUT -> COMPROVED
        this.sendPut(emails)
      } else {
        this.sendPost(emails, self)
      }
    },
    sendPut (emails) {
      const usersToAdd = emails.map(email => { return { email } })

      let payload
      if (this.assessmentRole === 'assessor') payload = { assessorsToAdd: usersToAdd }
      else payload = { usersToAdd }

      this.$http.put(this.assessmentUrl, payload)
        .then(() => { this.cleanForm() })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.sending = false })
    },
    sendPost (emails, self) {
      // If no course, only add user on organization level
      const organization = this.user.organization._id

      let roles = emails.map(email => ({ recipientEmail: email, model: 'organization', contextId: organization, role: this.justStudents ? 'student' : this.role, downgrade: false, sendEmail: (!this.course) }))

      if (this.course) {
        const courseRoles = emails.map(email => ({ recipientEmail: email, model: 'course', contextId: this.course._id, role: this.justStudents ? 'student' : this.role, downgrade: false, sendEmail: true }))
        roles = roles.concat(courseRoles)
      }

      // POST
      this.$http.post('users/invite', { invitations: roles }, { params: { toSelf: self } })
        .then(() => { this.cleanForm() })
        .catch((e) => { console.log(e); this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.sending = false })
    },
    cleanForm () {
      this.form.recipients = ''
      this.showDomainWarning = false
      this.$message({ message: this.$i18n.t('SW_EMAILS_SENT'), type: 'success' })
      this.closeDialog(true)
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
