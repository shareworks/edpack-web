<template>
  <div>
    <page-cover>
      <!-- App language -->
      <app-language class="pull-right"/>

      <!-- Go back button -->
      <el-button type="text" @click="goBack" aria-label="Go back" class="btn-back">
        <i class="icon-arrow_back"/>
        <span>{{ $t('SW_BACK') }}</span>
      </el-button>

      <!-- Header -->
      <page-header :title="$t('SW_SETTINGS')" icon="icon-lock" :area="$t('SW_ADMIN_ONLY')" :intro="$t('SW_SETTINGS_SHORT', { school: form.name.en })"/>

      <!-- Tabs -->
      <el-tabs v-model="toTab" @tab-click="tabClick">
        <el-tab-pane :label="tab.label" :name="tab.value" :key="tab.value" v-for="tab in tabs"/>
      </el-tabs>
    </page-cover>

    <!-- Settings page content -->
    <div class="page-body" v-if="status === 'done'">
      <el-form ref="form" :model="form" label-width="220px" :label-position="['questions'].includes(settingsMode) ? 'top' : 'left'">

        <!-- Content Component -->
        <component :is="tabs[settingsMode].name" :form="form"/>
        <!-- Submit or cancel -->
        <el-form-item class="mt-20" v-if="canShowControlsButton">
          <el-button type="primary" @click="onSubmit" class="mr-10" :loading="submitting">{{ $t('SW_SAVE_CHANGES') }}</el-button>
          <router-link to="/admin">
            <el-button type="text">{{ $t('SW_CANCEL') }}</el-button>
          </router-link>
        </el-form-item>
      </el-form>
    </div>

    <!-- Loading -->
    <spinner v-else-if="status === 'loading'" class="mt-30"></spinner>

    <!-- Error -->
    <div class="text-muted text-center mt-30" v-if="status === 'error'">{{ $t('SW_ERROR_LOADING') }}</div>
  </div>
</template>

<script>
import Vue from 'vue'
import VueClipboards from 'vue-clipboards'
import OrgGeneralSettings from '@/edpack-web/components/OrgGeneralSettings'
import OrgOptions from '@/components/OrgOptions'
import OrgFacultiesSettings from '@/edpack-web/components/OrgFacultiesSettings'
import OrgIntegrationSettings from '@/edpack-web/components/OrgIntegrationSettings'

Vue.use(VueClipboards)

export default {
  name: 'OrgSettingsWrapper',
  metaInfo: { title: 'Settings' },
  props: ['tabs'],
  components: { OrgGeneralSettings, OrgOptions, OrgFacultiesSettings, OrgIntegrationSettings },

  data () {
    return {
      school: Vue.util.extend({}, this.$store.state.school),
      form: Vue.util.extend({}, this.$store.state.school),
      settingsMode: this.$route.params.settingsMode || 'general',
      toTab: this.$route.params.settingsMode || 'general',
      submitting: false,
      status: 'loading'
    }
  },

  created () {
    this.getOrg()
  },

  watch: {
    $route (to) {
      if (!to.params.settingsMode) to.params.settingsMode = 'general'
      if (to.params.settingsMode !== this.settingsMode) this.settingsMode = to.params.settingsMode
    },
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
      if (this.settingsMode !== 'faculties' && this.settingsMode !== 'categories') return true
      if (this.settingsMode === 'faculties' && this.form.faculties.length > 0) return true
      if (this.settingsMode === 'categories' && this.form.categories.length > 0) return true

      return false
    }
  },

  methods: {
    goBack () { this.$router.push({ name: 'admin' }) },
    getOrg () {
      this.$http.get(`organizations/${this.school._id}`)
        .then((res) => {
          // Use JSON.parse(JSON.stringify(obj)) to prevent deep bindings, see Vue.utils.extend issue: https://github.com/vuejs/vue/issues/1849
          this.school = JSON.parse(JSON.stringify(res.data.list[0]))
          this.status = 'done'
        })
        .catch(() => { this.status = 'error' })
    },
    tabClick () {
      if (this.form.isChanged) {
        this.$confirm(this.$i18n.t('SW_DISCARD_CHANGED_TEXT'), this.$i18n.t('SW_DISCARD_CHANGED'), {
          confirmButtonText: this.$i18n.t('SW_DISCARD_AND_CONTINUE'),
          cancelButtonText: this.$i18n.t('SW_CANCEL')
        }).then(() => {
          this.form = JSON.parse(JSON.stringify(this.school))
          this.settingsMode = this.toTab
        }).catch(() => { this.toTab = this.settingsMode })
      } else {
        this.settingsMode = this.toTab
        this.$router.replace({ name: 'settings', params: { slug: this.school.slug, settingsMode: this.toTab } })
      }
    },
    onSubmit () {
      if (this.form.domainError) {
        return this.$message({ message: this.$i18n.t('SW_DOMAINS_ERROR', this.form.domainError.length), type: 'error' })
      }

      if (this.$store.state.languages.length === 1) {
        const currentLanguage = this.form.languages.en ? 'en' : 'nl'
        const anotherLanguage = this.form.languages.en ? 'nl' : 'en'

        this.form.name[anotherLanguage] = this.form.name[currentLanguage]
        this.form.terminology.faculty[anotherLanguage] = this.form.terminology.faculty[currentLanguage]
        this.form.terminology.faculties[anotherLanguage] = this.form.terminology.faculties[currentLanguage]

        if (this.form.categories) this.form.categories.forEach(category => { category[anotherLanguage] = category[currentLanguage] })
        if (this.form.faculties) this.form.faculties.forEach(faculty => { faculty[anotherLanguage] = faculty[currentLanguage] })
      }

      this.submitting = true
      this.form.shortName.nl = this.form.shortName.en
      if (this.form.faculties) { this.form.faculties = this.form.faculties.filter(fac => fac.en || fac.nl || fac._id) }
      if (this.form.categories) { this.form.categories = this.form.categories.filter(cat => cat.en || cat.nl || cat._id) }

      this.$http.put(`organizations/${this.form._id}`, this.form)
        .then((res) => {
          const school = res.data.list[0]
          this.$store.state.user.organization = school
          this.$store.dispatch('setUser', this.$store.state.user)
          this.school = JSON.parse(JSON.stringify(school))
          this.$message({ message: this.$i18n.t('SW_CHANGES_SAVED'), type: 'success' })
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.submitting = false })
    }
  }
}
</script>
