<template>
  <div>
    <page-cover>
      <!-- App language -->
      <app-language class="pull-right"></app-language>
      <!-- Go back button -->
      <router-link :to="{ name: 'admin', params: { mode: 'courses', slug: school.slug } }" class="btn-back">
        <i class="icon-arrow_back"></i>
        <span>{{ $t('SW_BACK') }}</span>
      </router-link>

      <!-- Header -->
      <page-header :title="$t('SW_SETTINGS')" icon="icon-lock" :area="$t('SW_ADMIN_ONLY')" :intro="$t('SW_SETTINGS_SHORT', { school: form.name.en })"></page-header>

      <!-- Tabs -->
      <slot name="tabs"></slot>
    </page-cover>

    <!-- Settings page content -->
    <div class="page-body">
      <el-form ref="form" :model="form" label-width="220px" :label-position="['questions'].includes(activeTab) ? 'top' : 'left'">

      <slot name="tables"></slot>

        <!-- Submit or cancel -->
        <el-form-item class="mt-20" v-if="canShowControlsButton">
          <el-button type="primary" @click="onSubmit" class="mr-10" :loading="submitting">{{ $t('SW_SAVE_CHANGES') }}</el-button>
          <router-link :to="{ name: 'admin', params: {mode: 'courses', slug: school.slug }}">
            <el-button type="text">{{ $t('SW_CANCEL') }}</el-button>
          </router-link>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import VueClipboards from 'vue-clipboards'

Vue.use(VueClipboards)

export default {
  name: 'OrgSettingsWrapper',
  metaInfo: { title: 'Settings' },
  props: ['toTab', 'activeTab', 'setActiveTab', 'orgLoaded', 'setOrgLoaded', 'form', 'setForm'],

  data () {
    return {
      school: Vue.util.extend({}, this.$store.state.school),
      submitting: false
    }
  },

  watch: {
    form: {
      handler () {
        ('isChanged' in this.form) ? this.form.isChanged = true : this.form.isChanged = false
      },
      deep: true
    }
  },

  updated () {
    if (this.$store.state.school.enableFreshChat && window.fcWidget) {
      window.fcWidget.show()
    } else if (!this.$store.state.school.enableFreshChat && window.fcWidget) {
      window.fcWidget.hide()
    }
  },

  mounted () {
    this.getOrg()
  },

  computed: {
    canShowControlsButton () {
      if (this.activeTab !== 'faculties' && this.activeTab !== 'categories') return true
      if (this.activeTab === 'faculties' && this.form.faculties.length > 0) return true
      if (this.activeTab === 'categories' && this.form.categories.length > 0) return true

      return false
    }
  },

  methods: {
    getOrg () {
      this.$http.get(`organizations/${this.school._id}`)
        .then((res) => {
          // Use JSON.parse(JSON.stringify(obj)) to prevent deep bindings, see Vue.utils.extend issue: https://github.com/vuejs/vue/issues/1849
          this.school = JSON.parse(JSON.stringify(res.data.list[0]))
          this.setForm(JSON.parse(JSON.stringify(res.data.list[0])))
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.setOrgLoaded(true) })
    },
    isJustOneLanguage () {
      return (this.form.languages.en && !this.form.languages.nl) || (!this.form.languages.en && this.form.languages.nl)
    },
    onSubmit () {
      if (this.isJustOneLanguage()) {
        const currentLanguage = this.form.languages.en ? 'en' : 'nl'
        const anotherLanguage = this.form.languages.en ? 'nl' : 'en'

        this.form.name[anotherLanguage] = this.form.name[currentLanguage]
        this.form.terminology.faculty[anotherLanguage] = this.form.terminology.faculty[currentLanguage]
        this.form.terminology.faculties[anotherLanguage] = this.form.terminology.faculties[currentLanguage]

        this.form.categories.forEach(category => { category[anotherLanguage] = category[currentLanguage] })
        this.form.faculties.forEach(faculty => { faculty[anotherLanguage] = faculty[currentLanguage] })
      }

      this.submitting = true
      this.form.shortName.nl = this.form.shortName.en
      this.form.faculties = this.form.faculties.filter(fac => fac.en || fac.nl || fac._id)
      this.form.categories = this.form.categories.filter(cat => cat.en || cat.nl || cat._id)

      this.$http.put(`organizations/${this.form._id}`, this.form)
        .then((res) => {
          const school = res.data.list[0]
          this.$store.state.user.organization = school
          this.$store.dispatch('setUser', this.$store.state.user)
          this.school = JSON.parse(JSON.stringify(school))
          this.setForm(JSON.parse(JSON.stringify(school)))
          this.$message({ message: this.$i18n.t('SW_CHANGES_SAVED'), type: 'success' })
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.submitting = false })
    }
  }
}
</script>
