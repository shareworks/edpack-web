<template>
  <div>
    <p class="mb-20">{{ $t('SW_LIMIT_ASSESSMENT_FORM', [user.name]) }}</p>
    <el-form label-width="180px">
      <!-- Amount of assessments -->
      <el-form-item :label="$t('SW_NEW_ASSESSMENTS')">
        <el-input-number v-model="form.limit" :max="100" size="small"></el-input-number>
        <span class="ml-10">{{ $t('SW_LIMIT_CURRENTLY')}}:</span>
        <strong> {{ form.limit + assessmentsLeft }}</strong>
      </el-form-item>
      <!-- Expire date -->
      <el-form-item :label="$t('SW_EXPIRE_DATE')">
        <el-date-picker v-model="form.exp" type="datetime" :clearable="true" format="dd-MM-yyyy HH:mm" :placeholder="$t('SW_SELECT_DATE_TIME')" :picker-options="expireDateOptions"></el-date-picker>
        <el-button v-if="form.exp" class="ml-10" type="text" @click="form.exp = null">
          <span>{{ $t('SW_REMOVE_EXPIRE_DATE') }}</span>
        </el-button>
      </el-form-item>

      <!-- Action buttons -->
      <el-button type="primary" @click="submitCreditLimit()" :loading="submitting">
        <i class="icon-send"></i>
        {{ $t('SW_SUBMIT') }}
      </el-button>
      <el-button type="text" @click="closeDialog()">{{ $t('SW_CANCEL') }}</el-button>
    </el-form>
  </div>
</template>

<script>
import moment from 'moment'
const momentConfig = { hour: 12, minute: 0, second: 0, millisecond: 0 }

export default {
  name: 'PayAsYouGoDialog',
  props: ['closeDialog', 'user'],

  data () {
    return {
      submitting: false,
      assessmentsLeft: this.user.credits.used > this.user.credits.limit ? 0 : this.user.credits.limit - this.user.credits.used,
      form: {
        limit: this.user.credits.limit,
        exp: this.user.credits.exp || (this.user.credits.limit ? null : moment(new Date()).set(momentConfig).add(90, this.$i18n.tc('SW_DAYS', 2)))
      },
      expireDateOptions: { disabledDate (time) { return (new Date(time)).getTime() < new Date() } }
    }
  },

  methods: {
    submitCreditLimit () {
      if (this.submitting) return
      this.submitting = true
      const params = {
        limit: this.form.limit + (this.user.credits.limit || 0),
        exp: this.form.exp ? new Date(this.form.exp) : null
      }

      this.$http.put('users/' + this.user._id + '/credits', {}, { params })
        .then(() => {
          this.$message({ message: this.$i18n.t('SW_ASSESSMENT_LIMIT_POSTED'), type: 'success' })
          this.submitting = false
          this.closeDialog(true)
        })
        .catch(() => { this.submitting = false })
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
