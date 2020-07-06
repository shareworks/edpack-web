<template>
  <div class="multi-lang">
    <el-form :model="form" label-width="150px">

      <!-- Full name -->
      <el-form-item :label="$t('SW_ORG_FULL_NAME')" prop="name.en" required :show-message="false">
        <inputs-with-flags :change="setNewName" :value="form.name" name="full" :placeholder="$t('SW_ORG_FULL_NAME')" :isAutofocus="true"/>
      </el-form-item>

      <!-- Short name -->
      <el-form-item :label="$t('SW_ORG_SHORT_NAME')" prop="shortName.en" required :show-message="false">
        <el-input v-model="form.shortName.en"></el-input>
      </el-form-item>

      <!-- Create or cancel -->
      <el-form-item class="mt-20">
        <el-button type="primary" @click="createOrg" :loading="submitting">
          {{ $t('SW_CREATE_ORG') }}
          <i class="icon-arrow_forward"></i>
        </el-button>
        <el-button type="text" @click="closeDialog">{{ $t('SW_CANCEL') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import InputsWithFlags from '../InputsWithFlags'

export default {
  name: 'CreateOrg',
  props: ['closeDialog'],
  components: { InputsWithFlags },

  data () {
    return {
      school: this.$store.state.school,
      user: this.$store.state.user,
      lang: this.$store.state.lang,
      submitting: false,
      form: {
        name: { en: '', nl: '' },
        shortName: { en: '', nl: '' }
      }
    }
  },

  methods: {
    setNewName (lang, value) { this.form.name[lang] = value },
    createOrg () {
      if (this.submitting) return
      if (!this.form.name.nl.trim() || !this.form.name.en.trim()) return this.$message({ message: this.$i18n.t('SW_NO_ORG_NAME'), type: 'error' })
      this.submitting = true
      this.form.shortName.nl = this.form.shortName.en

      this.$http.post('organizations', this.form)
        .then((res) => {
          this.form.name = { en: '', nl: '' }
          this.$message({ message: this.$i18n.t('SW_ORG_CREATED'), type: 'success' })
          this.$store.state.user.organizations.push(res.data.list[0])
          this.closeDialog(true)
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.submitting = false })
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
