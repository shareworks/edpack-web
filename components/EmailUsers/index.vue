<template>
  <div>
    <p class="mb-30" v-if="app">{{ $t('SW_EMAIL_FOLLOWER', [selectedUsers[0].name, app.toolName]) }}</p>
    <p class="mb-30" v-else-if="directMessage">{{ $t('SW_EMAIL_USER', [selectedUsers[0].name]) }}</p>
    <p class="mb-30" v-else-if="!directMessage && !app">{{ $t('SW_EMAIL_DIALOG_USERS_TEXT') }}</p>
    <el-form label-position="top">
      <!-- Subject -->
      <el-form-item>
        <el-input v-model="form.subject" ref="subject" :placeholder="app ? $t('SW_EMAIL_APP_SUBJECT', [app.toolName]) : $t('SW_EMAIL_SUBJECT_PLACEHOLDER')"></el-input>
      </el-form-item>

      <!-- Message -->
      <el-form-item v-if="directMessage || app || comments" :label="$t('SW_MESSAGE')">
        <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 8}" :placeholder="$t('SW_EMAIL_MESSAGE_PLACEHOLDER')" v-model="form.message">
        </el-input>
      </el-form-item>

      <!-- Send to self -->
      <el-form-item>
        <el-checkbox :label="$t('SW_SEND_TO_SELF')" v-model="form.toSelf" name="type"></el-checkbox>
      </el-form-item>

      <!-- Send or cancel -->
      <el-form-item>
        <el-button type="primary" @click="sendEmail" :loading="sending">
          <i class="icon-send"></i>
          <strong>{{ $t('SW_SEND_EMAIL') }}</strong>
        </el-button>
        <el-button type="text" class="ml-10" @click="closeDialog(false)">{{ $t('SW_CANCEL') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'EmailUsers',
  props: ['closeDialog', 'selectedUsers', 'directMessage', 'app', 'comments'],

  data () {
    return {
      user: this.$store.state.user,
      sending: false,
      form: {
        subject: this.$i18n.t('SW_REMINDER_SUBJECT_DEFAULT'),
        message: this.$i18n.t('SW_REMINDER_TEXT_DEFAULT'),
        toSelf: true
      }

    }
  },

  mounted () {
    this.$nextTick(() => this.$refs.subject.focus())
    console.log('this.selectedUsers', this.selectedUsers)
    console.log('this.app', this.app)
  },

  methods: {
    sendEmail () {
      if (this.sending) return
      this.sending = true

      if (!this.form.subject || !this.form.message) return this.$message({ message: this.$i18n.t('SW_FILL_REQUIRED'), type: 'error' })

      const users = this.selectedUsers.map(user => user._id)
      const self = this.form.toSelf
      const message = this.form.message
      const subject = this.form.subject
      const body = { message, subject, users }

      this.$http.post('users/message', body, { params: { toSelf: self } })
        .then(() => {
          this.$message({ message: this.$i18n.t('SW_EMAILS_SENT'), type: 'success' })
          this.closeDialog()
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
