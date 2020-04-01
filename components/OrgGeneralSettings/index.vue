<template>
  <div :class="{ 'multi-lang': form.languages.en && form.languages.nl }">
    <!-- Full name EN -->
    <el-form-item :label="$t('SW_ORG_FULL_NAME')" required class="form-en" v-show="form.languages.en">
      <el-input v-model="form.name.en"></el-input>
    </el-form-item>
    <!-- Full name NL -->
    <el-form-item :label="$t('SW_ORG_FULL_NAME')" required class="form-nl" v-show="form.languages.nl">
      <el-input v-model="form.name.nl"></el-input>
    </el-form-item>
    <!-- Short name -->
    <el-form-item :label="$t('SW_ORG_SHORT_NAME')" required>
      <el-input v-model="form.shortName.en"></el-input>
    </el-form-item>
    <!-- Notification email -->
    <el-form-item :label="$t('SW_ORG_NOTIFICATION_EMAIL')" required>
      <el-input v-model="form.notificationEmail" type="email"></el-input>
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
        <el-option v-for="language in languages" :key="language"
                   :label="$t('SW_DEFAULT_' + language.toUpperCase())"
                   :value="language">
          <img :src="'/images/' + language + '.png'" class="language-icon mr-5" alt="">
          <span>{{ $t('SW_DEFAULT_' + language.toUpperCase()) }}</span>
        </el-option>
      </el-select>
    </el-form-item>
    <!-- Brand color -->
    <el-form-item :label="$t('SW_BRAND_COLOR')">
      <el-color-picker v-model="form.brandColor"></el-color-picker>
    </el-form-item>
    <!-- Thumbnail -->
    <el-form-item :label="$t('SW_ORG_THUMB')">
      <el-button class="mb-5" @click="pickFile('thumbnailUrl')">
        <i class="icon-camera"></i>
        <span class="mr-5">Upload</span> <small class="text-muted">(min. 200x200)</small>
      </el-button>
      <a :href="form.thumbnailUrl" target="_blank">
        <thumbnail v-if="form.thumbnailUrl" :model="form" class="ml-10 thumb-42"></thumbnail>
      </a>
    </el-form-item>
    <!-- Logo -->
    <el-form-item :label="$t('SW_ORG_LOGO')">
      <el-button class="mb-5" @click="pickFile('logoUrl')">
        <i class="icon-camera"></i>
        <span class="mr-5">Upload</span> <small class="text-muted">(min. 600x200)</small>
      </el-button>
      <a :href="form.logoUrl" target="_blank">
        <thumbnail v-if="form.logoUrl" :model="form.logoUrl" class="logo-org ml-10"></thumbnail>
      </a>
    </el-form-item>
    <!-- Website URL -->
    <el-form-item :label="$t('SW_ORG_WEBSITE_LINK')">
      <el-input v-model="form.websiteUrl" type="url" placeholder="https://about.your-school.com ..."></el-input>
    </el-form-item>
    <!-- Faculty term EN -->
    <el-form-item :label="$t('SW_ORG_FACULTYTERM_NAME')" v-if="school.enableManualCourses" required class="form-en" v-show="form.languages.en">
      <el-input v-model="form.terminology.faculty.en"></el-input>
    </el-form-item>
    <!-- Faculty term NL -->
    <el-form-item :label="$t('SW_ORG_FACULTYTERM_NAME')" v-if="school.enableManualCourses" required class="form-nl" v-show="form.languages.nl">
      <el-input v-model="form.terminology.faculty.nl"></el-input>
    </el-form-item>
    <!-- Faculties term EN -->
    <el-form-item :label="$t('SW_ORG_FACULTIESTERM_NAME')" v-if="school.enableManualCourses" required class="form-en" v-show="form.languages.en">
      <el-input v-model="form.terminology.faculties.en"></el-input>
    </el-form-item>
    <!-- Faculties term NL -->
    <el-form-item :label="$t('SW_ORG_FACULTIESTERM_NAME')" v-if="school.enableManualCourses" required class="form-nl" v-show="form.languages.nl">
      <el-input v-model="form.terminology.faculties.nl"></el-input>
    </el-form-item>
  </div>
</template>

<script>
import config from 'config'
import * as filestack from 'filestack-js'
import convertDiacritics from '@/utils/convert-diacritics'

export default {
  name: 'OrgGeneralSettings',
  props: ['form'],

  data () {
    return {
      school: this.$store.state.school,
      user: this.$store.state.user,
      lang: this.$store.state.lang,
      editorOptions: {},
      languages: config.languages,
      filepicker: filestack.init(config.filestack.key)
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
    errorUploading () {
      this.$message({ message: this.$i18n.t('SW_ERROR_LOADING'), type: 'error' })
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
