<template>
  <div>
    <router-view v-if="status === 'done'"></router-view>

    <div class="mt-30 text-muted text-center">
      <!-- Loading -->
      <spinner v-if="status === 'loading'"></spinner>

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
export default {
  name: 'Course',
  metaInfo: { title: 'Course' },

  data () {
    return {
      course: false,
      status: 'loading',
      submitting: false
    }
  },

  created () {
    return this.$http.get(`courses/${this.$route.params.course}`)
      .then((res) => {
        this.$store.dispatch('setCourse', res.data.list[0])
        this.course = res.data.list[0]
        this.status = this.course ? 'done' : 'error'
        if (!this.isAuthorized()) this.$router.replace({ name: 'error', query: { type: 'restricted_access' } })
        if (this.course.archivedDate) this.status = 'archived'
      })
      .catch((err) => {
        this.status = 'error'
        if (this.$route.name === 'student') this.$router.replace({ name: 'error', query: { type: 'course_inactive' } })
        else if (err.status === 404) this.$router.replace({ name: 'error', query: { type: 'not_found' } })
      })
  },

  methods: {
    isAuthorized () {
      if (this.$store.state.user.systemAdmin) return true
      if (this.$store.state.school.role === 'admin') return true

      // Check course role
      if (!this.course) return false
      const courseRole = this.course.role
      if (this.$route.meta.minimumCourseRole === 'staff') return courseRole === 'staff'
      if (this.$route.meta.minimumCourseRole === 'student') return courseRole === 'student'

      // specific comproved code
      if (config.isComproved && this.$route.meta.minimumCourseRole === 'assessor') {
        return courseRole === 'assessor'
      }
    },
    unarchiveCourse () {
      if (this.submitting) return
      this.submitting = true

      this.$http.put(`courses/${this.course._id}/status`, {}, { params: { status: 'active' } })
        .then(() => {
          this.$message({ message: this.$i18n.t('SW_COURSE_ACTIVATED'), type: 'success' })
          this.course.archivedDate = false
          this.status = 'done'
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.submitting = false })
    }
  }
}
</script>
