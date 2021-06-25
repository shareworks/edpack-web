<template>
  <div :class="{ 'multi-lang': !isJustOneLanguage }">
    <!-- Faculty Alert -->
    <el-alert type="info" class="mb-20" :title="$t('SW_ATTENTION')" show-icon
              :description="$t('SW_FACULTY_INFO_TEXT', [form.terminology.faculties[lang].toLowerCase(), form.terminology.faculty[lang].toLowerCase()])"/>

    <el-form-item :label="form.terminology.faculties[lang]">
      <p class="form-help-text">{{ $t('SW_EXPLAIN_FACULTY_LIST', [form.terminology.faculties[lang].toLowerCase()]) }}</p>

      <el-row v-if="form.faculties.length > 0" :gutter="10">
        <el-col v-for="language in languages" :key="language" :span="calcSpan">
          <strong class="mb-10" v-if="!isJustOneLanguage">
            {{ $t(`SW_DEFAULT_${language.toUpperCase()}`) }}
            <img :src="`/img/${language}.png`" class="ml-5 language-icon" alt="language-icon">
          </strong>
          <strong class="mb-10" v-else>{{ form.terminology.faculty[lang] }}</strong>

          <!-- Faculties -->
          <div v-for="(faculty, index) in form.faculties" :key="index">
            <div class="mb-10">
              <el-input v-model="faculty[language]">
                <template slot="prepend">#{{index + 1}}</template>
              </el-input>
            </div>
          </div>
        </el-col>

        <!-- Canvas account ID part -->
        <el-col :span="calcSpan" v-if="form.lmsApiIntegration && form.lms === 'canvas'">
          <strong class="mb-10">
            {{ $t('SW_ACCOUNT_ID') }}
          </strong>
          <div v-for="(faculty, index) in form.faculties" :key="index">
            <div class="mb-10">
              <el-input v-if="faculty.canvas" v-model="faculty.canvas.id">
                <template slot="prepend">#{{index + 1}}</template>
              </el-input>
              <el-input v-else :disabled="true">
                <template slot="prepend">#{{index + 1}}</template>
              </el-input>
            </div>
          </div>
        </el-col>

        <!-- Brightspace account ID part -->
        <el-col :span="calcSpan" v-if="form.lmsApiIntegration && form.lms === 'brightspace'">
          <strong class="mb-10">
            {{ $t('SW_ACCOUNT_ID') }}
          </strong>
          <div v-for="(faculty, index) in form.faculties" :key="index">
            <div class="mb-10">
              <el-input v-if="faculty.brightspace" v-model="faculty.brightspace.id">
                <template slot="prepend">#{{index + 1}}</template>
              </el-input>
              <el-input v-else :disabled="true">
                <template slot="prepend">#{{index + 1}}</template>
              </el-input>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- Add faculty -->
      <el-button @click="addFaculty" class="block">
        <i class="icon-add"/>
        {{ $t('SW_ADD_FACULTY', [form.terminology.faculty[lang].toLowerCase()]) }}
      </el-button>
    </el-form-item>
  </div>
</template>

<script>
import { addLanguagePropToObject } from '@/edpack-web/utils/add-language-props-to-object'
export default {
  name: 'OrgFacultiesSettings',
  props: ['form'],

  data () {
    return {
      languages: this.$store.state.languages,
      school: this.$store.state.school,
      user: this.$store.state.user,
      lang: this.$store.state.lang
    }
  },

  computed: {
    isJustOneLanguage () { return this.$store.state.languages.length === 1 },
    calcSpan () {
      let span = 1
      if (this.form.lmsApiIntegration && ['canvas', 'brightspace'].includes(this.form.lms)) span++
      if (!this.isJustOneLanguage) span++
      return 24 / span
    }
  },

  methods: {
    addFaculty () {
      const length = this.form.faculties.length
      const previousFacultyExist = length && this.languages.reduce((previous, current) => { return this.form.faculties[length - 1][current].trim() ? previous += 1 : previous }, 0)

      const newFaculty = { canvas: { id: '' } }
      addLanguagePropToObject(newFaculty, this.languages)

      if (!length || previousFacultyExist) this.form.faculties.push(newFaculty)
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
