<template>
  <div class="multi-lang">
    <el-form :model="form" label-width="150px">
      <!-- Full name EN -->
      <el-form-item :label="$t('SW_ORG_FULL_NAME')" prop="name.en" required :show-message="false">
        <el-input ref="nameEn" name="nameEn" id="nameEn" size="medium" maxlength="200" v-model="form.name.en" autofocus :placeholder="$t('SW_ORG_FULL_NAME')">
          <template slot="prepend"><img :src="'/images/en.png'" class="language-icon" alt="language-icon"></template>
        </el-input>
        <!-- Full name NL -->
        <el-input ref="nameNl" name="nameNl" id="nameNl" size="medium" maxlength="200" v-model="form.name.nl" autofocus :placeholder="$t('SW_ORG_FULL_NAME')">
          <template slot="prepend"><img :src="'/images/nl.png'" class="language-icon" alt="language-icon"></template>
        </el-input>
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
export default {
  name: 'CreateOrg',
  props: ['closeDialog'],

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

  mounted () {
    this.$nextTick(() => this.$refs.nameEn.focus())
  },

  methods: {
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
