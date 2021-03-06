<template>
  <div>
    <p class="mb-20">{{ $t('SW_EMAIL_DIALOG_ORGANIZATIONS_TEXT') }}</p>
    <el-form label-width="160px">
      <!-- Subject -->
      <el-form-item :label="$t('SW_SUBJECT')">
        <el-input v-model="form.subject" ref="subject" :placeholder="$t('SW_EMAIL_SUBJECT_PLACEHOLDER')"/>
      </el-form-item>

      <!-- Message -->
      <el-form-item  :label="$t('SW_MESSAGE')">
        <redactor :config="editorOptions" ref="blogPost" v-model="form.message"/>
      </el-form-item>

      <!-- Roles -->
      <el-form-item :label="$tc('SW_ROLE', 2)">
        <p class="form-help-text">{{ $t('SW_WHICH_ROLES_NEWSLETTER') }}</p>

        <el-checkbox-group v-model="form.roles">
          <el-checkbox label="admin" class="mr-20">{{ $tc('SW_ADMIN', 2) }}</el-checkbox>
          <el-checkbox label="staff" class="mr-20">{{ school.terminology.instructors[lang] }}</el-checkbox>
          <el-checkbox label="student" class="mr-20">{{ school.terminology.students[lang] }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <!-- Send, test or cancel -->
      <el-form-item>
        <el-button type="primary" @click="sendEmail(false)" :loading="sending">
          <i class="icon-send"/>
          <strong>{{ $t('SW_SEND_NEWSLETTER') }}</strong>
        </el-button>
        <el-button @click="sendEmail(true)" :loading="sending">
          <strong>{{ $t('SW_SEND_TO_SELF_FIRST') }}</strong>
        </el-button>
        <el-button type="text" class="ml-10" @click="closeDialog(false)">{{ $t('SW_CANCEL') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'Newsletter',
  props: ['closeDialog', 'selectedOrgs'],
  components: { Redactor: () => import('@/edpack-web/components/Redactor') },

  data () {
    return {
      user: this.$store.state.user,
      lang: this.$store.state.lang,
      school: this.$store.state.school,
      sending: false,
      form: {
        subject: '',
        message: '',
        roles: []
      },
      toSelfOnly: false,

      sendToAdmin: true,
      sendToStaff: true,
      sendToStudent: false,

      editorOptions: {}
    }
  },

  mounted () {
    this.$nextTick(() => this.$refs.subject.focus())
  },

  methods: {
    sendEmail (toSelfOnly) {
      if (this.sending) return
      this.sending = true

      if (!this.form.subject || !this.form.message) return this.$message({ message: this.$i18n.t('SW_FILL_REQUIRED'), type: 'error' })

      const organizations = this.selectedOrgs.map(org => org._id)
      const message = this.form.message
      const subject = this.form.subject
      const toRoles = this.form.roles

      if (!toRoles.length) return this.$message({ message: this.$i18n.t('SW_ROLES_REQUIRED'), type: 'error' })
      if (!organizations.length) return this.$message({ message: this.$i18n.t('SW_ORGANIZATIONS_REQUIRED'), type: 'error' })

      this.$http.post('messages/newsletter', { subject, message, toSelfOnly, toRoles, organizations })
        .then(() => {
          this.$message({ message: this.$i18n.t('SW_EMAILS_SENT'), type: 'success' })
          this.form.message = ''
          this.form.subject = ''
          this.form.roles = []
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
</style>
