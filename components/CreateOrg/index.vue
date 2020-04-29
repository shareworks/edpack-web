<template>
  <div class="multi-lang">
    <el-form :model="form" label-width="150px">
      <CreateOrgForm :form="form" :school="school" :setNewName="setNewName"></CreateOrgForm>

      <!-- Create or cancel -->
      <el-form-item class="mt-20">
        <el-button type="primary" @click="createOrg" :loading="submitting">{{ $t('SW_CREATE_ORG') }}</el-button>
        <el-button type="text" @click="closeDialog">{{ $t('SW_CANCEL') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import CreateOrgForm from '../../../components/CreateOrgForm'

export default {
  name: 'CreateOrg',
  props: ['closeDialog'],
  components: { CreateOrgForm },

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
      if (!this.form.name.nl || !this.form.name.en) return this.$message({ message: this.$i18n.t('SW_NO_ORG_NAME'), type: 'error' })
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
