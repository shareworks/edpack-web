<template>
  <div>
    <page-cover class="mb-30">
      <!-- Download products results -->
      <page-header :title="$t('SW_CREDITS')"/>
      <p class="mb-20">{{ $t('SW_LIMIT_CREDITS_FORM', [user.name]) }}</p>
    </page-cover>

    <el-form label-width="180px">
      <!-- Amount of assessments -->
      <el-form-item :label="$t('SW_NEW_ASSESSMENTS')">
        <el-input-number v-model="form.limitChange" :max="100" size="small"></el-input-number>
        <span class="ml-10">{{ $t('SW_LIMIT_CURRENTLY')}}:</span>
        <strong> {{ this.user.credits.used + user.credits.limit + form.limitChange }}</strong>
      </el-form-item>

      <!-- Expire date -->
      <el-form-item :label="$t('SW_EXPIRE_DATE')">
        <el-date-picker v-model="form.exp" type="datetime" :clearable="true" format="dd-MM-yyyy HH:mm" :placeholder="$t('SW_SELECT_DATE_TIME')" :picker-options="expireDateOptions"/>
        <el-button v-if="form.exp" class="ml-10" type="text" @click="form.exp = null">
          <span>{{ $t('SW_REMOVE_EXPIRE_DATE') }}</span>
        </el-button>
      </el-form-item>

      <!-- Action buttons -->
      <el-form-item>
        <el-button type="primary" @click="submitCreditLimit()" :loading="submitting">
          <i class="icon-send"></i>
          {{ $t('SW_SUBMIT') }}
        </el-button>
        <el-button type="text" @click="closeDialog()">{{ $t('SW_CANCEL') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import moment from 'moment'
const momentConfig = { hour: 12, minute: 0, second: 0, millisecond: 0 }

export default {
  name: 'CreditsEdit',
  props: ['closeDialog', 'user'],

  data () {
    return {
      submitting: false,
      form: {
        limitChange: 0,
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
        limit: this.user.credits.limit + this.form.limitChange,
        exp: this.form.exp ? new Date(this.form.exp) : null
      }

      this.$http.put('users/' + this.user._id + '/credits', {}, { params })
        .then(() => {
          this.user.credits.isNew = false
          this.user.credits.limit = params.limit
          this.user.credits.exp = params.exp
          this.$message({ message: this.$i18n.t('SW_CREDITS_LIMIT_POSTED'), type: 'success' })
          this.closeDialog(this.user)
        })
        .catch((err) => { console.log(err) })
        .finally(() => { this.submitting = false })
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
