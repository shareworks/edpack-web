<template>
  <div>
    <p class="mb-20">{{ $t('SW_CREATE_COURSE_TEXT') }}</p>

    <!-- Form -->
    <el-form label-width="150px" :model="form" @submit.prevent.native="createCourse">
      <create-course-form :school="school" :form="form" :lang="lang"></create-course-form>

      <el-form-item v-if="showCoursesTemplate" :label="$t('SW_COURSE_TEMPLATE')">
        <el-select v-model="courseTemplate" :default-first-option="false" clearable>
          <el-option v-for="course in courses" :key="course._id" :label="course.name" :value="course"></el-option>
        </el-select>
      </el-form-item>

      <!-- Create or cancel -->
      <el-form-item class="mt-20">
        <el-button type="primary" @click="createCourse" :loading="submitting">
          {{ $t('SW_CREATE_COURSE') }}
          <i class="icon-arrow_forward"></i>
        </el-button>
        <el-button type="text" class="ml-10" @click="closeDialog">{{ $t('SW_CANCEL') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import config from 'config'
import CreateCourseForm from '../../../components/CreateCourseForm'
export default {
  name: 'CreateCourse',
  props: ['closeDialog'],
  components: { CreateCourseForm },

  data () {
    return {
      showCoursesTemplate: config.name = 'Growflow',
      school: this.$store.state.school,
      lang: this.$store.state.lang,
      submitting: false,
      courses: [],
      courseTemplate: '',
      form: {
        organization: this.$store.state.school._id,
        name: '',
        faculty: '',
        status: this.$store.state.inLTI ? 'inactive' : 'active'
      }
    }
  },

  mounted() {
    this.getCourses()
  },

  methods: {
    getCourses () {
      this.$http.get('courses')
      .then(res => { this.courses = res.data.list })
    },
    createCourse () {
      if (this.submitting) return
      if (!this.form.name.trim()) return this.$message({ message: this.$i18n.t('SW_NO_COURSE_NAME'), type: 'error' })
      if (!this.form.faculty) this.form.faculty = undefined
      this.submitting = true

      if (this.courseTemplate !== '') {
        this.form.goals = this.courseTemplate.goals
        this.form.projectLabels = this.courseTemplate.projectLabels
        this.form.enablePersonalGoals = this.courseTemplate.enablePersonalGoals
      }

      this.$http.post('courses', this.form)
        .then(() => {
          this.$message({ message: this.$i18n.t('SW_COURSE_CREATED'), type: 'success' })
          this.form.name = ''
          this.form.faculty = ''
          this.closeDialog(true)
        })
        .catch(() => {
          this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') })
        })
        .finally(() => { this.submitting = false })
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import 'style';
</style>
