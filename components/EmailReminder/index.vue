<template>
  <div>
    <p class="mb-20">{{ $t('SW_SEND_EMAIL_TO_UNFILLED')}} {{ $t('SW_EMAIL_DIALOG_TEXT') }}</p>

    <!-- Reminder already sent earlier -->
    <el-alert show-icon class="mb-20" type="warning" v-if="evaluation.remindedDate" :title="$t('SW_ATTENTION')">
      <p>{{ $t('SW_REMINDER_SENT_SOME_TIME_AGO', [remindedDate]) }}</p>
    </el-alert>

    <el-form label-position="top">
      <!-- Subject -->
      <el-form-item class="mb-10">
        <el-input v-model="form.subject" ref="subject" :placeholder="$t('SW_EMAIL_SUBJECT_PLACEHOLDER')"></el-input>
      </el-form-item>

      <!-- Message -->
      <el-form-item class="mb-10">
        <el-input type="textarea" autofocus :autosize="{ minRows: 2, maxRows: 4}" :placeholder="$t('SW_EMAIL_MESSAGE_PLACEHOLDER')" v-model="form.message">
        </el-input>
      </el-form-item>

      <!-- Send to self -->
      <el-form-item>
        <el-checkbox :label="$t('SW_SEND_TO_SELF')" v-model="form.toSelf" name="type"></el-checkbox>
      </el-form-item>

      <!-- Send or cancel -->
      <el-form-item>
        <el-button type="primary" @click="sendReminder" :loading="sending">
          <i class="icon-send"></i>
          <strong>{{ $t('SW_SEND_EMAIL') }}</strong>
        </el-button>
        <el-button type="text" class="ml-10" @click="closeDialog(false)">{{ $t('SW_CANCEL') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'EmailUsers',
  props: ['closeDialog', 'evaluation'],

  data () {
    return {
      user: this.$store.state.user,
      sending: false,
      form: {
        subject: '',
        message: '',
        toSelf: true
      },
      remindedDate: moment(this.evaluation.remindedDate).fromNow()
    }
  },

  mounted () {
    this.$nextTick(() => this.$refs.subject.focus())
  },

  methods: {
    sendReminder () {
      if (this.sending) return
      this.sending = true

      const form = this.form

      if (!form.subject || !form.message) return this.$message({ message: this.$i18n.t('SW_FILL_REQUIRED'), type: 'error' })
      this.sending = true

      const self = form.toSelf
      const message = form.message
      const subject = form.subject
      const evaluation = this.evaluation

      this.$http.post(`evaluations/${evaluation._id}/reminder`, { message, subject, evaluation }, { params: { toSelf: self } })
        .then(() => {
          this.$message({ message: this.$i18n.t('SW_EMAILS_SENT'), type: 'success' })
          this.closeDialog()
        })
        .catch(() => { this.$message({ message: this.$i18n.t('SW_GENERIC_ERROR'), type: 'error' }) })
        .finally(() => { this.sending = false })
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
