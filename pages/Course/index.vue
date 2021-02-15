<template>
  <div>
    <router-view v-if="status === 'done'"/>

    <div class="mt-30 text-muted text-center">
      <!-- Loading -->
      <spinner v-if="status === 'loading'"/>

      <!-- Error -->
      <div v-if="status === 'error'">{{ $t('SW_ERROR_LOADING') }}</div>
      <!-- Archived -->
      <div v-if="status === 'archived'">
        <p class="mb-30">{{ $t('SW_COURSE_IS_ARCHIVED') }}</p>
        <el-button type="primary" size="medium" v-if="this.course.role !== 'student'" :loading="submitting" @click="unarchiveCourse">
          {{ $t('SW_UNARCHIVE') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import config from 'config'
import getLmsType from '@/edpack-web/utils/get-lms-type'

export default {
  name: 'Course',
  metaInfo: { title: 'Course' },

  data () {
    return {
      course: false,
      status: 'loading',
      submitting: false,
      school: this.$store.state.school,
      appName: config.name
    }
  },

  mounted () {
    this.getCourse()
  },

  methods: {
    getCourse () {
      return this.$http.get(`courses/${this.$route.params.course}`)
        .then((res) => {
          const course = res.data.list[0]

          // If no access, stop here
          if (!this.isAuthorized(course)) return this.$router.replace({ name: 'error', query: { type: 'restricted_access' } })

          // LMS access token available? Make sure API integration course config is done first
          const lms = getLmsType(course)
          if (lms && this.school.activeLmsTokens.includes(lms) && course.lmsApiIntegration && !course[lms].isConfiguredWithApi) {
            return this.configureWithLms(lms, course)
          }

          // No LMS config required? Just set course
          this.setCourse(course)
        })
        .catch((err) => {
          this.status = 'error'
          console.log(err)
          if (this.$route.name === 'student') this.$router.replace({ name: 'error', query: { type: 'course_inactive' } })
          else if (err.status === 404) this.$router.replace({ name: 'error', query: { type: 'not_found' } })
        })
    },
    configureWithLms (lms, course) {
      // Configure course with lms API (build pageUrl and set faculty from LMS data)
      this.$http.put(`courses/${course._id}/${lms}/configure`)
        .then((res) => {
          this.setCourse(res.data.list[0])
          this.$message({ type: 'success', message: this.$i18n.t('SW_SUCCESSFULLY_CONFIGURED', [lms]) })
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_CONFIGURE_ERROR') }) })
        .finally(() => {
          this.loading = false
        })
    },
    setCourse (course) {
      this.course = course
      this.$store.dispatch('setCourse', course)
      this.status = this.course ? 'done' : 'error'
      if (this.course.archivedDate) this.status = 'archived'
    },
    isAuthorized (course) {
      if (this.$store.state.user.systemAdmin) return true
      if (this.$store.state.user.role === 'admin') return true

      // Check course role
      if (!course || !course.role) return false
      if (this.$route.meta.minimumCourseRole === 'staff') return course.role === 'staff'
      if (this.$route.meta.minimumCourseRole === 'student') return ['student', 'staff', 'assessor'].includes(course.role)
      if (this.$route.meta.minimumCourseRole === 'assessor') return ['staff', 'assessor'].includes(course.role)
    },
    unarchiveCourse () {
      if (this.submitting) return
      this.submitting = true

      this.$http.put(`courses/${this.course._id}/status`, {}, { params: { status: 'active' } })
        .then(() => {
          this.$message({ message: this.$i18n.t('SW_COURSE_ACTIVATED', [this.appName]), type: 'success' })
          this.course.archivedDate = false
          this.status = 'done'
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.submitting = false })
    }
  }
}
</script>
