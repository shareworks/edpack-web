<template>
  <div>
    <slot/>
    <p class="mb-30" v-if="!hasSlotData">{{ $t('SW_EMAIL_DIALOG_USERS_TEXT', [appName]) }}</p>

    <el-form label-position="top">
      <!-- Subject -->
      <el-form-item>
        <el-input :name="$t('SW_EMAIL_SUBJECT_PLACEHOLDER')" v-model="form.subject" ref="subject" :placeholder="$t('SW_EMAIL_SUBJECT_PLACEHOLDER')"/>
      </el-form-item>

      <!-- Message -->
      <el-form-item :label="$t('SW_MESSAGE')">
        <el-input :name="$t('SW_MESSAGE')" type="textarea" :autosize="{ minRows: 3, maxRows: 8}" :placeholder="$t('SW_EMAIL_MESSAGE_PLACEHOLDER')" v-model="form.message"/>
      </el-form-item>

      <!-- Send to self -->
      <el-form-item>
        <el-checkbox :aria-label="$t('SW_SEND_TO_SELF')" :label="$t('SW_SEND_TO_SELF')" v-model="form.toSelf" name="type"/>
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
import config from 'config'
export default {
  name: 'EmailUsers',
  props: ['closeDialog', 'selectedUsers', 'course', 'evaluation', 'assessment', 'needSupport'],

  data () {
    return {
      user: this.$store.state.user,
      sending: false,
      appName: config.name,
      form: {
        subject: '',
        message: '',
        toSelf: true
      }
    }
  },

  mounted () {
    this.$nextTick(() => this.$refs.subject.focus())
  },

  computed: {
    hasSlotData () { return this.$slots.default }
  },

  methods: {
    sendEmail () {
      if (this.sending) return
      this.sending = true

      if (!this.form.subject || !this.form.message) return this.$message({ message: this.$i18n.t('SW_FILL_REQUIRED'), type: 'error' })

      const recipients = this.selectedUsers.map(user => user._id)
      const self = this.form.toSelf
      const message = this.form.message
      const subject = this.form.subject
      const needSupport = this.needSupport

      const body = { message, subject, recipients, needSupport }

      // If course context is given, add course _id to body payload
      if (this.course) body.course = this.course._id

      // If evaluation context is given, add evaluation _id to body payload
      if (this.evaluation) body.evaluation = this.evaluation._id

      // If assessment context is given, add assessment _id to body payload
      if (this.assessment) body.assessment = this.assessment._id

      this.$http.post('messages/personal', body, { params: { toSelf: self } })
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
