<template>
  <div class="courses-cards">
    <masonry :cols="{default: 3, 1000: 2, 700: 1}" :gutter="{default: '30px', 700: '20px'}">
      <div v-for="(course, index) in courses" :key="index">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <el-button @click="$router.push({ name: (course.role || 'staff'), params: { course: course._id, slug: school.slug } })" size="medium" class="text-ellipsis" type="text">
              {{course.name}}
              <lms-icon :model="course"></lms-icon>
            </el-button>
          </div>

          <el-row>
            <el-col :span="12">
              <div v-if="course.createdBy" class="text-ellipsis">
                <thumbnail :model="course.createdBy" class="thumb-user thumb-24"></thumbnail>
                {{course.createdBy.name}}
              </div>
            </el-col>
            <el-col :span="12">
              <div class="pull-right">
                <div class="text-muted text-ellipsis font-12">
                  {{ course.createdDate | fromNow }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </div>
    </masonry>
  </div>
</template>

<script>
import LmsIcon from '@/edpack-web/components/LmsIcon'
import moment from 'moment'

export default {
  name: 'CoursesCards',
  props: ['courses'],
  components: { LmsIcon },

  data () {
    return {
      school: this.$store.state.school
    }
  },

  filters: {
    fromNow: function (date) { return moment(date).fromNow(true) }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
