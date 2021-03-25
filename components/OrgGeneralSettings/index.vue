<template>
  <div :class="{ 'multi-lang': form.languages.en && form.languages.nl }">

    <!-- Full name -->
    <el-form-item :label="$t('SW_ORG_FULL_NAME')" prop="name.en" required :show-message="false">
      <inputs-with-flags :change="setNewName" :value="form.name" name="full" :placeholder="$t('SW_ORG_FULL_NAME')"/>
    </el-form-item>

    <!-- Production -->
    <el-form-item :label="$t('SW_PRODUCTION')">
      <el-switch v-model="form.production" active-color="#13ce66" inactive-color="#ff4949"/>
      <span class="text-muted ml-10">{{ $t('SW_PRODUCTION_TEXT') }}</span>
    </el-form-item>

    <!-- Short name -->
    <el-form-item :label="$t('SW_ORG_SHORT_NAME')" required>
      <el-input v-model="form.shortName.en"/>
    </el-form-item>

    <!-- Custom app name -->
    <el-form-item v-if="useCustomApp" :label="$t('SW_APP_NAME')">
      <el-input v-model="form.appName" placeholder="Optionally use replace aApp name with ..."/>
    </el-form-item>

    <!-- Custom app header -->
    <el-form-item v-if="useCustomApp" :label="$t('SW_APP_HEADER')">
      <el-input v-model="form.appHeader" placeholder="Optionally replace header text with ..."/>
    </el-form-item>

    <!-- Notification email -->
    <el-form-item :label="$t('SW_ORG_NOTIFICATION_EMAIL')" required>
      <el-input v-model="form.notificationEmail" type="email"/>
    </el-form-item>

    <!-- Timezone -->
    <el-form-item :label="$t('SW_ORG_TIMEZONE')" required>
      <el-select class="block" v-model="form.timezone">
        <el-option v-for="timezone in timezones" :key="timezone" :label="timezone" :value="timezone"/>
      </el-select>
    </el-form-item>

    <!-- Languages -->
    <el-form-item :label="$t('SW_ORG_LANGUAGES')" required>
      <div class="checkboxes-row">
        <el-checkbox v-for="language in languages" :key="language" :disabled="!form.languages[language === 'en' ? 'nl' : 'en']" @change="updateDefault"
                     v-model="form.languages[language]" :label="language">{{ $t('SW_DEFAULT_' + language.toUpperCase()) }}</el-checkbox>
      </div>
    </el-form-item>

    <!-- Default language -->
    <el-form-item :label="$t('SW_DEFAULT_LANGUAGE')">
      <el-select class="block" v-model="form.defaultLanguage" :disabled="!form.languages.nl || !form.languages.en">
        <el-option v-for="language in languages" :key="language" :label="$t('SW_DEFAULT_' + language.toUpperCase())" :value="language">
          <img :src="'/img/' + language + '.png'" class="language-icon mr-5" alt="language-icon">
          <span>{{ $t('SW_DEFAULT_' + language.toUpperCase()) }}</span>
        </el-option>
      </el-select>
    </el-form-item>

    <!-- Brand color -->
    <el-form-item :label="$t('SW_BRAND_COLOR')" class="hide">
      <el-color-picker v-model="form.brandColor"/>
    </el-form-item>

    <!-- Thumbnail -->
    <el-form-item :label="$t('SW_ORG_THUMB')">
      <el-button class="mb-5" @click="pickFile('thumbnailUrl')">
        <i class="icon-camera"/>
        <span class="mr-5">{{ $t('SW_UPLOAD') }}</span> <small class="text-muted">{{ $t('SW_MIN', [200, 200]) }}</small>
      </el-button>
      <a :href="form.thumbnailUrl" target="_blank">
        <thumbnail v-if="form.thumbnailUrl" :model="form" class="ml-10 thumb-42"/>
      </a>
    </el-form-item>

    <!-- Logo -->
    <el-form-item :label="$t('SW_ORG_LOGO')">
      <el-button class="mb-5" @click="pickFile('logoUrl')">
        <i class="icon-camera"/>
        <span class="mr-5">{{ $t('SW_UPLOAD') }}</span> <small class="text-muted">{{ $t('SW_MIN', [600, 200]) }}</small>
      </el-button>
      <a :href="form.logoUrl" target="_blank">
        <thumbnail v-if="form.logoUrl" :model="form.logoUrl" class="logo-org ml-10"/>
      </a>
    </el-form-item>

    <!-- Logo link URL -->
    <el-form-item v-if="useCustomApp" :label="$t('SW_ORG_LOGO_LINK')">
      <el-input v-model="form.logoLink" type="url" placeholder="https://department.your-school.com/section ..."/>
    </el-form-item>

    <!-- Website URL -->
    <el-form-item :label="$t('SW_ORG_WEBSITE_LINK')">
      <el-input v-model="form.websiteUrl" type="url" placeholder="https://about.your-school.com ..."/>
    </el-form-item>

    <!-- Faculty term EN -->
    <el-form-item :label="$t('SW_ORG_FACULTYTERM_NAME')" v-if="school.enableManualCourses" required>
      <inputs-with-flags :change="setNewFaculty" :value="form.terminology.faculty" name="facultyTerm"/>
    </el-form-item>

    <!-- Faculties term EN -->
    <el-form-item :label="$t('SW_ORG_FACULTIESTERM_NAME')" v-if="school.enableManualCourses" required>
      <inputs-with-flags :change="setNewFaculties" :value="form.terminology.faculties" name="facultiesTerm"/>
    </el-form-item>

    <!-- Plan term EN -->
    <el-form-item :label="$t('SW_ORG_PLANTERM_NAME')" v-if="usePlansTerminology && school.enablePlans" required>
      <inputs-with-flags :change="setNewPlan" :value="form.terminology.plan" name="planTerm"/>
    </el-form-item>

    <!-- Plans term EN -->
    <el-form-item :label="$t('SW_ORG_PLANSTERM_NAME')" v-if="usePlansTerminology && school.enablePlans" required>
      <inputs-with-flags :change="setNewPlans" :value="form.terminology.plans" name="plansTerm"/>
    </el-form-item>

    <!-- Introduction by school EN -->
    <el-form-item v-if="introBySchool" :class="isJustOneLanguage ? '' : 'form-en'" :label="$t('SW_INTRO_FOR')">
      <p class="text-muted">{{ $t('SW_INTRO_FOR_NEWLY') }}</p>
      <redactor :config="editorOptions" v-model="form.orgCourseIntro.en"/>
    </el-form-item>

    <!-- Introduction by school NL -->
    <el-form-item v-if="introBySchool" :class="isJustOneLanguage ? '' : 'form-nl'" :label="$t('SW_INTRO_FOR')">
      <p class="text-muted">{{ $t('SW_INTRO_FOR_NEWLY') }}</p>
      <redactor :config="editorOptions" v-model="form.orgCourseIntro.nl"/>
    </el-form-item>

    <!-- Colofon EN -->
    <el-form-item :label="$t('SW_COLOFON')" :class="isJustOneLanguage ? '' : 'form-en'" v-show="form.languages.en">
      <redactor :config="editorOptions" ref="ColofonEN" v-model="form.colofon.en"/>
    </el-form-item>
    <!-- Colofon NL -->
    <el-form-item :label="$t('SW_COLOFON')" :class="isJustOneLanguage ? '' : 'form-nl'" v-show="form.languages.nl">
      <redactor :config="editorOptions" ref="ColofonNL" v-model="form.colofon.nl"/>
    </el-form-item>
  </div>
</template>

<script>
import config from 'config'
import timezones from '@/edpack-web/timezones.json'
import * as filestack from 'filestack-js'
import InputsWithFlags from '../InputsWithFlags'
import convertDiacritics from '../../utils/convert-diacritics'

export default {
  name: 'OrgGeneralSettings',
  props: ['form'],
  components: { InputsWithFlags, Redactor: () => import('@/edpack-web/components/Redactor') },

  computed: {
    isJustOneLanguage () {
      return this.$store.state.languages.length === 1
    }
  },

  data () {
    return {
      useCustomApp: config.useCustomApp,
      usePlansTerminology: config.usePlansTerminology,
      school: this.$store.state.school,
      user: this.$store.state.user,
      lang: this.$store.state.lang,
      editorOptions: {},
      introBySchool: config.introBySchool,
      languages: config.languages,
      filepicker: filestack.init(config.filestack.key),
      timezones: timezones.values
    }
  },

  methods: {
    pickFile (type) {
      const customSettings = {
        accept: ['image/*'],
        imageMax: type === 'logoUrl' ? [1200, 400] : [400, 400],
        imageMin: type === 'logoUrl' ? [600, 200] : [200, 200],
        transformations: { crop: { force: true, aspectRatio: type === 'logoUrl' ? 3 / 1 : 1 / 1 } },
        onFileSelected: (file) => this.cleanFileName(file),
        onFileUploadFailed: (file, err) => this.errorUploading(),
        onUploadDone: (files) => this.doneUploading(files, type)
      }

      const settings = Object.assign(config.filestack.default_settings, customSettings)
      this.filepicker.picker(settings).open()
    },
    updateDefault () {
      this.$store.dispatch('setLanguages', this.form.languages)
      if (this.form.languages.en && this.form.languages.nl) return
      this.form.defaultLanguage = this.form.languages.en ? 'en' : 'nl'
    },
    cleanFileName (file) {
      file.name = convertDiacritics(file.filename.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_')
      return file
    },
    doneUploading (result, type) {
      result.filesUploaded.forEach((file) => {
        this.form[type] = file.url
        this.$forceUpdate()
      })
    },
    errorUploading () { this.$message({ message: this.$i18n.t('SW_ERROR_LOADING'), type: 'error' }) },
    setNewName (lang, value) { this.form.name[lang] = value },
    setNewFaculty (lang, value) { this.form.terminology.faculty[lang] = value },
    setNewFaculties (lang, value) { this.form.terminology.faculties[lang] = value },
    setNewPlan (lang, value) { this.form.terminology.plan[lang] = value },
    setNewPlans (lang, value) { this.form.terminology.plans[lang] = value }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
