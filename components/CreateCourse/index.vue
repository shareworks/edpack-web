<template>
  <div>
    <p class="mb-20">{{ $t('SW_CREATE_COURSE_TEXT') }}</p>

    <!-- Form -->
    <el-form label-width="150px" :model="form" @submit.prevent.native="createCourse">
      <create-course-form :school="school" :form="form" :lang="lang"></create-course-form>
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
import CreateCourseForm from '../../../components/CreateCourseForm'
export default {
  name: 'CreateCourse',
  props: ['closeDialog'],
  components: { CreateCourseForm },

  data () {
    return {
      school: this.$store.state.school,
      user: this.$store.state.user,
      lang: this.$store.state.lang,
      submitting: false,
      form: {
        organization: this.$store.state.school._id,
        name: '',
        faculty: '',
        status: this.$store.state.inLTI ? 'inactive' : 'active'
      }
    }
  },

  methods: {
    createCourse () {
      if (this.submitting) return
      if (!this.form.name) return this.$message({ message: this.$i18n.t('SW_NO_COURSE_NAME'), type: 'error' })
      if (!this.form.faculty) this.form.faculty = undefined
      this.submitting = true

      this.$http.post('courses', this.form)
        .then((res) => {
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
