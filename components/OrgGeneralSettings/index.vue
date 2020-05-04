<template>
  <div :class="{ 'multi-lang': form.languages.en && form.languages.nl }">

    <!-- Full name EN -->
    <el-form-item :label="$t('SW_ORG_FULL_NAME')" prop="name.en" required :show-message="false">
      <inputs-with-flags :change="setNewName" :value="form.name" name="full" :placeholder="$t('SW_ORG_FULL_NAME')"/>
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
    <el-form-item :label="$t('SW_ORG_FACULTYTERM_NAME')" v-if="school.enableManualCourses" required>
      <inputs-with-flags :change="setNewFaculty" :value="form.terminology.faculty" name="facultyTerm"/>
    </el-form-item>

    <!-- Faculties term EN -->
    <el-form-item :label="$t('SW_ORG_FACULTIESTERM_NAME')" v-if="school.enableManualCourses" required>
      <inputs-with-flags :change="setNewFaculties" :value="form.terminology.faculties" name="facultiesTerm"/>
    </el-form-item>
  </div>
</template>

<script>
import config from 'config'
import * as filestack from 'filestack-js'
import InputsWithFlags from '../InputsWithFlags'
import convertDiacritics from '../../utils/convert-diacritics'

export default {
  name: 'OrgGeneralSettings',
  props: ['form'],
  components: { InputsWithFlags },

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

  mounted() {
    console.log('form', this.form)
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
    errorUploading () {
      this.$message({ message: this.$i18n.t('SW_ERROR_LOADING'), type: 'error' })
    },
    setNewName (lang, value) { this.form.name[lang] = value },
    setNewFaculty (lang, value) { this.form.terminology.faculty[lang] = value },
    setNewFaculties (lang, value) { this.form.terminology.faculties[lang] = value }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
