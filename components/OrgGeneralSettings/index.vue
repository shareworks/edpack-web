<template>
  <div :class="{ 'multi-lang': !isJustOneLanguage }">

    <!-- Full name -->
    <el-form-item :label="$t('SW_ORG_FULL_NAME')" prop="name.en" required :show-message="false">
      <inputs-with-flags :change="setNewName" :value="form.name" name="full" :placeholder="$t('SW_ORG_FULL_NAME')"/>
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

    <!-- Countries -->
    <el-form-item :label="$t('SW_ORG_COUNTRY')" required>
      <el-select class="block" v-model="form.country" filterable>
        <el-option v-for="country in countries" :key="country" :label="country" :value="country"/>
      </el-select>
    </el-form-item>

    <!-- Timezone -->
    <el-form-item :label="$t('SW_ORG_TIMEZONE')" required>
      <el-select class="block" v-model="form.timezone" filterable>
        <el-option v-for="timezone in timezones" :key="timezone" :label="timezone" :value="timezone"/>
      </el-select>
    </el-form-item>

    <!-- Languages -->
    <el-form-item :label="$t('SW_ORG_LANGUAGES')" required>
      <div class="checkboxes-row">
        <el-checkbox v-for="language in languages" :key="language" :disabled="isJustOneLanguage && form.languages[language]" @change="updateDefault"
                     v-model="form.languages[language]" :label="language">{{ $t('SW_DEFAULT_' + language.toUpperCase()) }}</el-checkbox>
      </div>
    </el-form-item>

    <!-- Default language -->
    <el-form-item :label="$t('SW_DEFAULT_LANGUAGE')">
      <el-select class="block" v-model="form.defaultLanguage" :disabled="isJustOneLanguage">
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

    <!-- Production -->
    <el-form-item :label="$t('SW_PRODUCTION')">
      <el-switch v-model="form.production" active-color="#13ce66" inactive-color="#ff4949"/>
      <span class="text-muted ml-10">{{ $t('SW_PRODUCTION_TEXT') }}</span>
    </el-form-item>

    <!-- Use email password combination -->
    <el-form-item :label="$t('SW_ALLOW_EMAIL_LOGIN')">
      <el-switch v-model="form.loginByPassword" active-color="#13ce66" :disabled="!isSysAdmin" inactive-color="#ff4949"/>
      <span class="text-muted ml-10">{{ $t('SW_ALLOW_EMAIL_LOGIN_TEXT', [appName]) }}</span><span v-if="!isSysAdmin" class="font-12 text-muted ml-10">{{ $t('SW_SYS_ADMIN_ONLY') }}</span>
    </el-form-item>

    <!-- Select auth options -->
    <el-form-item :label="$t('SW_AUTH_OPTIONS')">
      <el-select v-model="form.alternativeAuthOptions" class="w-50" multiple :placeholder="$t('SW_SELECT')">
        <el-option v-for="option in authOptions" :key="option" :label="$t(`SW_${option.toUpperCase()}`)" :value="option"/>
      </el-select>

      <el-popover placement="top-start" width="400" trigger="click">
        <a class="cursor-pointer ml-5" slot="reference"><i class="icon-question question-circle question-pop ml-5"/></a>
        <p class="text-muted ml-10">{{ $t('SW_ALLOW_AUTH_OPTIONS_LOGIN', [appName]) }} <span v-if="!isSysAdmin" class="font-12 text-muted ml-10">{{ $t('SW_SYS_ADMIN_ONLY') }}</span></p>
      </el-popover>
    </el-form-item>

    <div v-if="introBySchool">
      <!-- Introduction by school -->
      <el-form-item v-for="language in languages" :key="language" :class="isJustOneLanguage ? '' : `form-${language}`" :label="$t('SW_INTRO_FOR', [school.terminology.instructor[lang].toLowerCase()])">
        <p class="text-muted">{{ $t('SW_INTRO_FOR_NEWLY', [school.terminology.instructor[lang].toLowerCase()]) }}</p>
        <redactor :config="editorOptions" v-model="form.orgCourseIntro[language]"/>
      </el-form-item>
    </div>

    <!-- Colofon -->
    <el-form-item v-for="language in languages" :key="language" :class="isJustOneLanguage ? '' : `form-${language}`" :label="$t('SW_COLOFON')" v-show="form.languages[language]">
      <redactor :config="editorOptions" v-model="form.colofon[language]"/>
    </el-form-item>
  </div>
</template>

<script>
import config from 'config'
import timezones from '@/edpack-web/json/timezones.json'
import countries from '@/edpack-web/json/countries.json'
import * as filestack from 'filestack-js'
import InputsWithFlags from '../InputsWithFlags'
import convertDiacritics from '../../utils/convert-diacritics'

export default {
  name: 'OrgGeneralSettings',
  props: ['form'],
  components: { InputsWithFlags, Redactor: () => import('@/edpack-web/components/Redactor') },

  computed: {
    isJustOneLanguage () { return this.$store.state.languages.length === 1 }
  },

  data () {
    return {
      authOptions: ['microsoft', 'google'],
      appName: config.name,
      useCustomApp: config.useCustomApp,
      isSysAdmin: this.$store.state.user.systemAdmin,
      school: this.$store.state.school,
      user: this.$store.state.user,
      lang: this.$store.state.lang,
      editorOptions: {},
      introBySchool: config.introBySchool,
      languages: config.languages,
      filepicker: filestack.init(config.filestack.key),
      timezones: timezones.values,
      countries: countries.values
    }
  },

  methods: {
    pickFile (type) {
      const customSettings = {
        accept: ['image/*'],
        imageMax: type === 'logoUrl' ? [1200, 400] : [400, 400],
        imageMin: type === 'logoUrl' ? [600, 200] : [200, 200],
        transformations: { crop: { force: true, aspectRatio: type === 'logoUrl' ? 3 : 1 } },
        onFileSelected: (file) => this.cleanFileName(file),
        onFileUploadFailed: (file, err) => this.errorUploading(),
        onUploadDone: (files) => this.doneUploading(files, type)
      }

      const settings = Object.assign(config.filestack.default_settings, customSettings)
      this.filepicker.picker(settings).open()
    },
    updateDefault () {
      this.$store.dispatch('setLanguages', this.form.languages)
      if (this.isJustOneLanguage) {
        // @TODO: replace for third language -- i didn't find a good solution, right now
        this.form.defaultLanguage = this.form.languages.en ? 'en' : 'nl'
      }
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
    setNewName (lang, value) { this.form.name[lang] = value }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
