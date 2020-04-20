<template>
  <div :class="{ 'multi-lang': form.languages.en && form.languages.nl }">
    <el-alert type="info" class="mb-20" :title="$t('SW_ATTENTION')" show-icon :description="$t('SW_FACULTY_INFO_TEXT', [form.terminology.faculties[lang].toLowerCase(), form.terminology.faculty[lang].toLowerCase()])"></el-alert>

    <el-form-item :label="form.terminology.faculties[lang]">
      <p class="form-help-text">{{ $t('SW_EXPLAIN_FACULTY_LIST', [form.terminology.faculties[lang].toLowerCase()]) }}</p>

      <el-row v-if="form.faculties.length > 0" :gutter="10">
        <el-col :span="calcSpan" v-if="form.languages.en">
          <strong class="mb-10" v-if="form.languages.en && form.languages.nl">
            {{ $t('SW_DEFAULT_EN') }}
            <img :src="'/images/en.png'" class="ml-5 language-icon" alt="">
          </strong>
          <div v-for="(faculty, index) in form.faculties" :key="index">
            <div class="mb-10">
              <el-input v-model="faculty.en">
                <template slot="prepend">#{{index + 1}}</template>
              </el-input>
            </div>
          </div>
        </el-col>
        <el-col :span="calcSpan" v-if="form.languages.nl">
          <strong class="mb-10" v-if="form.languages.en && form.languages.nl">
            {{ $t('SW_DEFAULT_NL') }}
            <img :src="'/images/nl.png'" class="ml-5 language-icon" alt="">
          </strong>
          <div v-for="(faculty, index) in form.faculties" :key="index">
            <div class="mb-10">
              <el-input v-model="faculty.nl">
                <template slot="prepend">#{{index + 1}}</template>
              </el-input>
            </div>
          </div>
        </el-col>
        <el-col :span="calcSpan" v-if="form.lmsApiIntegration && form.availableLms.includes('canvas')">
          <strong class="mb-10">
            Canvas Account ID
          </strong>
          <div v-for="(faculty, index) in form.faculties" :key="index">
            <div class="mb-10">
              <el-input v-model="faculty.canvas.id">
                <template slot="prepend">#{{index + 1}}</template>
              </el-input>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- Add faculty -->
      <el-button @click="addFaculty" class="block">
        <i class="icon-add"></i>
        {{ $t('SW_ADD_FACULTY', [form.terminology.faculty[lang].toLowerCase()]) }}
      </el-button>
    </el-form-item>
  </div>
</template>

<script>

export default {
  name: 'OrgFacultiesSettings',
  props: ['form'],

  data () {
    return {
      school: this.$store.state.school,
      user: this.$store.state.user,
      lang: this.$store.state.lang
    }
  },

  computed: {
    calcSpan () {
      let span = 1
      if (this.form.lmsApiIntegration && this.form.availableLms.includes('canvas')) span++
      if (this.form.languages.en && this.form.languages.nl) span++
      return 24 / span
    }
  },

  methods: {
    addFaculty () {
      const length = this.form.faculties.length
      if (!length) this.form.faculties.push({ en: '', nl: '' })
      else if (this.form.faculties[length - 1].en !== '' || this.form.faculties[length - 1].nl !== '') {
        this.form.faculties.push({ en: '', nl: '', canvas: { id: '' } })
      }
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
