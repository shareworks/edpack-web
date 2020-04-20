<template>
  <div class="multi-lang">
    <el-form :model="form" label-width="150px">
      <!-- Full name EN -->
      <el-form-item :label="$t('SW_ORG_FULL_NAME')" prop="name.en" required :show-message="false">
        <input-with-flag v-if="school.languages.en" :isAutofocus="true" :change="setNewName" ref="nameEn" :isJustOneLanguage="isJustOneLanguage" :value="form.name.en" :form="form" lang="en" name="nameEn" id="nameEn" :placeholder="$t('SW_ORG_FULL_NAME')"/>
        <input-with-flag v-if="school.languages.nl" :change="setNewName" ref="nameNl" :isJustOneLanguage="isJustOneLanguage" :value="form.name.nl" :form="form" lang="nl" name="nameNl" id="nameNl" :placeholder="$t('SW_ORG_FULL_NAME')"/>
      </el-form-item>

      <!-- Short name -->
      <el-form-item :label="$t('SW_ORG_SHORT_NAME')" prop="shortName.en" required :show-message="false">
        <el-input v-model="form.shortName.en"></el-input>
      </el-form-item>

      <!-- Create or cancel -->
      <el-form-item>
        <el-button type="primary" @click="createOrg" :loading="submitting">{{ $t('SW_CREATE_ORG') }}</el-button>
        <el-button type="text" @click="closeDialog">{{ $t('SW_CANCEL') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import InputWithFlag from "../InputWithFlag/InputWithFlag"

export default {
  name: 'CreateOrg',
  props: ['closeDialog'],
  components: { InputWithFlag },

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

  computed: {
    isJustOneLanguage () {
      return this.school.languages.en && !this.school.languages.nl || !this.school.languages.en && this.school.languages.nl
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
