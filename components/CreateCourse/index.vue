<template>
  <div>
    <p class="mb-20">{{ $t('SW_CREATE_COURSE_TEXT') }}</p>

    <!-- Form -->
    <el-form label-width="150px" :model="form" @submit.prevent.native="createCourse">
      <create-course-form :school="school" :form="form" :lang="lang"></create-course-form>

      <!-- Course template -->
      <el-form-item class="mt-20" v-if="showCourseTemplate" :label="$t('SW_COURSE_TEMPLATE')">
        <el-select class="block" v-model="courseTemplate" :placeholder="$t('SW_COURSE_TEMPLATE_PLACEHOLDER')" :default-first-option="false" clearable>
          <el-option v-for="course in courses" :key="course._id" :label="course.name" :value="course._id">
            <strong class="mr-10">{{ course.name }}</strong>
            <span class="text-muted pull-right">{{ fromNow(course.createdDate) }}</span>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- Course ILearn integration -->
      <el-form-item class="mt-20" :label="$t('SW_COURSE_ILEARN')" v-if="(school.ilearn && school.ilearn.advantageApiId)">
        <el-switch v-model="form.ilearn.integration" active-color="#13ce66" inactive-color="#ff4949"/>
        <span class="text-muted ml-10">{{ $t('SW_COURSE_ILEARN_TEXT' )}}</span>
      </el-form-item>

      <!-- Create or cancel -->
      <el-form-item class="mt-20">
        <el-button type="primary" @click="createCourse" :loading="submitting">
          {{ $t('SW_CREATE_COURSE') }}
          <i class="icon-arrow_forward"/>
        </el-button>
        <el-button type="text" class="ml-10" @click="closeDialog">{{ $t('SW_CANCEL') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import config from 'config'
import CreateCourseForm from '../../../components/CreateCourseForm'
import moment from "moment";
export default {
  name: 'CreateCourse',
  props: ['closeDialog'],
  components: { CreateCourseForm },

  data () {
    return {
      school: this.$store.state.school,
      lang: this.$store.state.lang,
      showCourseTemplate: config.courseTemplate,
      submitting: false,
      courses: [],
      courseTemplate: '',
      form: {
        organization: this.$store.state.school._id,
        name: '',
        faculty: '',
        status: this.$store.state.inLTI ? 'inactive' : 'active',
        ilearn: {
          integration: !!(this.$store.state.school.ilearn && this.$store.state.school.ilearn.advantageApiId)
        }
      }
    }
  },

  mounted () {
    this.getCourses()
  },

  methods: {
    fromNow (date) { return moment(date).fromNow() },
    getCourses () {
      const params = { sort: 'createdDate', order: '-1' }
      this.$http.get('courses', { params })
        .then(res => { this.courses = res.data.list })
        .catch(e => console.log(e))
    },
    createCourse () {
      if (this.submitting) return
      if (!this.form.name.trim()) return this.$message({ message: this.$i18n.t('SW_NO_COURSE_NAME'), type: 'error' })
      if (!this.form.faculty) this.form.faculty = undefined
      this.submitting = true

      if (this.courseTemplate) {
        const course = this.courses.find(c => c._id === this.courseTemplate)

        this.form.goals = course.goals
        this.form.projectLabels = course.projectLabels
        this.form.enablePersonalGoals = course.enablePersonalGoals
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
