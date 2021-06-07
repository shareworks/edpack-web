<template>
  <div>
    <page-cover>
      <!-- App language -->
      <app-language class="pull-right"/>

      <!-- Go back button -->
      <el-button type="text" @click="cancel()" aria-label="Go back" class="btn-back">
        <i class="icon-arrow_back"/>
        <span>{{ $t('SW_BACK') }}</span>
      </el-button>

      <skip-to-main/>

      <!-- Header -->
      <page-header :title="$t('SW_SETTINGS')" icon="icon-lock" :area="$t('SW_ADMIN_ONLY')" :intro="$t('SW_SETTINGS_SHORT', { school: form.name.en })"/>

      <!-- Tabs -->
      <el-tabs v-model="toTab" @tab-click="tabClick">
        <el-tab-pane :label="tab.label" :name="tab.value" :key="tab.value" v-for="tab in tabs"/>
      </el-tabs>
    </page-cover>

    <div class="page-body" v-if="status === 'done'">
      <el-form ref="form" :model="form" label-width="220px" :label-position="['questions'].includes(settingsMode) ? 'top' : 'left'">

        <!-- Content Component -->
        <animated-tabs :to-left="toLeftDirection">
          <component :is="tabs[settingsMode].name" :form="form"/>
        </animated-tabs>

        <!-- Submit or cancel -->
        <el-form-item class="mt-20" v-if="canShowControlsButton">
          <el-button type="primary" @click="onSubmit" class="mr-10" :loading="submitting">{{ $t('SW_SAVE_CHANGES') }}</el-button>

            <el-button type="text" @click="cancel('force')">{{ $t('SW_CANCEL') }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Loading -->
    <spinner v-else-if="status === 'loading'" class="mt-30"></spinner>

    <!-- Error -->
    <div v-else-if="status === 'error'" class="text-muted text-center mt-30">{{ $t('SW_ERROR_LOADING') }}</div>
  </div>
</template>

<script>
import Vue from 'vue'
import isEqual from 'lodash/isEqual'
import VueClipboards from 'vue-clipboards'
import mergeEmptyLanguageFields from '@/edpack-web/utils/merge-empty-language-fields'

import OrgOptions from '@/components/OrgOptions'
import AnimatedTabs from '@/edpack-web/components/AnimatedTabs'
import OrgGeneralSettings from '@/edpack-web/components/OrgGeneralSettings'
import OrgFacultiesSettings from '@/edpack-web/components/OrgFacultiesSettings'
import OrgIntegrationSettings from '@/edpack-web/components/OrgIntegrationSettings'
import OrgTerminologySettings from '@/edpack-web/components/OrgTerminologySettings'

Vue.use(VueClipboards)

export default {
  name: 'OrgSettingsWrapper',
  metaInfo: { title: 'Settings' },
  props: ['tabs'],
  components: { OrgGeneralSettings, OrgOptions, OrgFacultiesSettings, OrgIntegrationSettings, OrgTerminologySettings, AnimatedTabs },

  data () {
    return {
      languages: this.$store.state.languages,
      school: Vue.util.extend({}, this.$store.state.school),
      form: Vue.util.extend({}, this.$store.state.school),
      settingsMode: this.$route.params.settingsMode || 'general',
      toTab: this.$route.params.settingsMode || 'general',
      submitting: false,
      status: 'loading',
      toLeftDirection: false
    }
  },

  created () {
    this.getOrg()
  },

  updated () {
    if (!window.fcWidget) return
    this.$store.state.school.enableFreshChat ? window.fcWidget.show() : window.fcWidget.hide()
  },

  watch: {
    $route (to) {
      if (!to.params.settingsMode) to.params.settingsMode = 'general'
      if (to.params.settingsMode !== this.settingsMode) {
        this.settingsMode = to.params.settingsMode
        this.toTab = to.params.settingsMode
      }
    },
    form: {
      deep: true,
      handler () {
        const unsavedChanges = !isEqual(this.school, this.form)
        this.$store.dispatch('setUnsavedChanges', unsavedChanges)
      }
    }
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
    getOrg () {
      this.$http.get(`organizations/${this.school._id}`)
        .then((res) => {
          this.updateSchool(res.data.list[0])
          this.status = 'done'
        })
        .catch(() => { this.status = 'error' })
    },
    tabClick () {
      if (this.toTab === this.settingsMode) return

      // initial value
      let fromTabIndex = null
      let toTabIndex = null

      let index = 0
      // run over object props
      for (const tab in this.tabs) {
        const tabValue = this.tabs[tab].value

        if (tabValue === this.settingsMode) fromTabIndex = index
        if (tabValue === this.toTab) toTabIndex = index
        index++
      }

      // calculate direction
      this.toLeftDirection = fromTabIndex > toTabIndex

      // show new tab
      this.$router.replace({ name: 'settings', params: { slug: this.school.slug, settingsMode: this.toTab } })
        .then(() => { this.form = JSON.parse(JSON.stringify(this.school)) })
        .catch(() => { this.toTab = this.settingsMode })
    },
    makeFirstLetterUpper (word) { return word.charAt(0).toUpperCase() + word.slice(1) },
    onSubmit () {
      if (this.form.domainError) {
        return this.$message({ message: this.$i18n.t('SW_DOMAINS_ERROR', this.form.domainError.length), type: 'error' })
      }

      this.submitting = true

      const propsToCheck = ['name', 'shortName']
      if (this.form.categories) propsToCheck.push('categories')
      if (this.form.faculties) propsToCheck.push('faculties')

      mergeEmptyLanguageFields(this.form, propsToCheck)
      mergeEmptyLanguageFields(this.form.terminology, ['faculty', 'faculties'])

      // make sure all terminology in lowercase mode
      const terminology = this.form.terminology
      this.languages.forEach(lang => {
        if (terminology.faculty) this.form.terminology.faculty[lang] = this.makeFirstLetterUpper(this.form.terminology.faculty[lang])
        if (terminology.faculties) this.form.terminology.faculties[lang] = this.makeFirstLetterUpper(this.form.terminology.faculties[lang])
        if (terminology.plan) this.form.terminology.plan[lang] = this.makeFirstLetterUpper(this.form.terminology.plan[lang])
        if (terminology.plans) this.form.terminology.plans[lang] = this.makeFirstLetterUpper(this.form.terminology.plans[lang])
        if (terminology.student) this.form.terminology.student[lang] = this.makeFirstLetterUpper(this.form.terminology.student[lang])
        if (terminology.students) this.form.terminology.students[lang] = this.makeFirstLetterUpper(this.form.terminology.students[lang])
        if (terminology.instructor) this.form.terminology.instructor[lang] = this.makeFirstLetterUpper(this.form.terminology.instructor[lang])
        if (terminology.instructors) this.form.terminology.instructors[lang] = this.makeFirstLetterUpper(this.form.terminology.instructors[lang])
      })

      // filter scope items to prevent saving empty values
      this.form.lmsConfig.scope = this.form.lmsConfig.scope.filter(scope => scope.trim().length)

      if (this.form.faculties) { this.form.faculties = this.form.faculties.filter(fac => fac.en || fac.nl || fac._id) }
      if (this.form.categories) { this.form.categories = this.form.categories.filter(cat => cat.en || cat.nl || cat._id) }

      this.$http.put(`organizations/${this.form._id}`, this.form)
        .then((res) => {
          this.updateSchool(res.data.list[0])
          this.$message({ message: this.$i18n.t('SW_CHANGES_SAVED'), type: 'success' })
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.submitting = false })
    },
    cancel (force) {
      if (force) this.$store.dispatch('setUnsavedChanges', false)
      this.$router.push({ name: 'admin' })
    },
    updateSchool (updatedSchool) {
      // Use JSON.parse(JSON.stringify(obj)) to prevent deep bindings, see Vue.utils.extend issue: https://github.com/vuejs/vue/issues/1849
      this.school = JSON.parse(JSON.stringify(updatedSchool))
      this.form = JSON.parse(JSON.stringify(updatedSchool))
      this.$store.state.user.organization = updatedSchool
      this.$store.dispatch('setUser', this.$store.state.user)
    }
  }
}
</script>
