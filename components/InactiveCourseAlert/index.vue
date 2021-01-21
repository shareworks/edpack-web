<template>
  <el-alert type="warning" class="mb-30" :title="$t('SW_COURSE_INACTIVE', [appName])">
    <p class="mb-10">{{$t('SW_INACTIVE_COURSE_TEXT', [appName])}}</p>
    <el-button :loading="activating" type="warning" @click="activateCourse">
      <i class="icon-ok-sign"/> {{$t('SW_ACTIVATE_COURSE', [appName])}}
    </el-button>
  </el-alert>
</template>

<script>
import config from 'config'

export default {
  name: 'InactiveCourseAlert',
  data () {
    return {
      activating: false,
      appName: config.name,
      course: this.$store.state.course
    }
  },
  methods: {
    activateCourse () {
      this.activating = true
      this.$http.put(`courses/${this.course._id}/status`, {}, { params: { status: 'active' } })
        .then(() => {
          this.$message({ message: this.$i18n.t('SW_COURSE_ACTIVATED', [this.appName]), type: 'success' })
          this.course.status = 'active'
        })
        .catch(e => console.log(e))
    }
  }
}
</script>
