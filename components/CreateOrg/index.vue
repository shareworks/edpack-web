<template>
  <div class="multi-lang">
    <el-form :model="form" label-width="150px">

      <!-- Full name -->
      <el-form-item :label="$t('SW_ORG_FULL_NAME')" prop="name.en" required :show-message="false">
        <inputs-with-flags :change="setNewName" :value="form.name" name="full" :placeholder="$t('SW_ORG_FULL_NAME')" :isAutofocus="true"/>
      </el-form-item>

      <!-- Short name -->
      <el-form-item :label="$t('SW_ORG_SHORT_NAME')" prop="shortName.en" required :show-message="false">
        <el-input :placeholder="$t('SW_SHORT_NAME_PLACEHOLDER')" v-model="form.shortName.en"/>
      </el-form-item>

      <!-- School as template -->
      <el-form-item class="mt-20" :label="$t('SW_SCHOOL_TEMPLATE')" v-if="orgs.length">
        <el-select class="block" v-model="form.orgTemplate" :placeholder="$t('SW_ORG_TEMPLATE_PLACEHOLDER')" :default-first-option="false" clearable>
          <el-option v-for="(org, index) in orgs" :label="org.name[lang]" :key="`org-${index}`" :value="org._id"/>
        </el-select>

        <!-- Explain limits of template -->
        <p class="font-12 text-muted">{{ $t('SW_ORG_TEMPLATE_WARNING') }}</p>
      </el-form-item>

      <!-- Production -->
      <el-form-item :label="$t('SW_PRODUCTION')">
        <el-switch v-model="form.production" active-color="#13ce66" inactive-color="#ff4949"/>
        <span class="text-muted ml-10">{{ $t('SW_PRODUCTION_TEXT') }}</span>
      </el-form-item>

      <!-- Create or cancel -->
      <el-form-item class="mt-20">
        <el-button type="primary" @click="createOrg" :loading="submitting">
          {{ $t('SW_CREATE_ORG') }}
          <i class="icon-arrow_forward"/>
        </el-button>
        <el-button type="text" class="ml-10" @click="closeDialog">{{ $t('SW_CANCEL') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import InputsWithFlags from '../InputsWithFlags'
import copyObjectProps from '@/edpack-web/utils/copy-object-props'
import mergeEmptyLanguageFields from '@/edpack-web/utils/merge-empty-language-fields'

export default {
  name: 'CreateOrg',
  props: ['closeDialog', 'orgs'],
  components: { InputsWithFlags },

  data () {
    return {
      school: this.$store.state.school,
      user: this.$store.state.user,
      lang: this.$store.state.lang,
      submitting: false,
      form: {
        name: { en: '', nl: '' },
        shortName: { en: '', nl: '' },
        orgTemplate: ''
      }
    }
  },

  methods: {
    setNewName (lang, value) { this.form.name[lang] = value },
    createOrg () {
      if (this.submitting) return
      if (!this.form.name.nl.trim() && !this.form.name.en.trim()) return this.$message({ message: this.$i18n.t('SW_NO_ORG_NAME'), type: 'error' })
      if (!this.form.shortName.nl.trim() && !this.form.shortName.en.trim()) return this.$message({ message: this.$i18n.t('SW_NO_ORG_NAME'), type: 'error' })

      mergeEmptyLanguageFields(this.form, ['name', 'shortName'])
      this.submitting = true


      if (this.form.orgTemplate) {
        this.form.terminology = {}
        this.form.orgCourseIntro = {}

        const templateOrg = this.orgs.find(org => org._id === this.form.orgTemplate)
        const generalSettings = ['notificationEmail', 'languages', 'defaultLanguage', 'thumbnailUrl', 'logoUrl', 'websiteUrl']
        const orgOptions = [
          'calculationModel', 'customPeerQuestions', 'enablePublicScoring', 'scoreMotivations', 'teamQuestions',
          'customTeamQuestions', 'enableCategories', 'peerMessages', 'topsTips', 'openQuestions', 'minimumAdjustmentFactor',
          'maximumAdjustmentFactor', 'adjustedFactorOnDefault', 'peerWitSelfDefault', 'positiveFactorWeight', 'negativeFactorWeight',
          'enableAdjustedToggle', 'enableWithSelfToggle', 'showLabelsToStudent', 'showMissingStudents', 'disableAutomatedEmails',
          'enableFreshChat', 'defaultOpenQuestion', 'defaultPeerQuestion', 'canvasGrading', 'brightspaceAvgGrading', 'brightspaceAdvancedGrading',
          'enableGradingWeights', 'enableGradingNotification', 'gradableAssignments', 'enableManualCourses', 'manualInviteOnly', 'loginByPassword'
        ]
        // run over props and copy them from template school
        copyObjectProps([...generalSettings, ...orgOptions], this.form, templateOrg)
        copyObjectProps(['faculty', 'faculties'], this.form.terminology, templateOrg.terminology)
        copyObjectProps(['en', 'nl'], this.form.orgCourseIntro, templateOrg.orgCourseIntro)
      }

      this.$http.post('organizations', this.form)
        .then((res) => {
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
