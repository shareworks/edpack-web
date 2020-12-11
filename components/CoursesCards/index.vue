<template>
  <div class="courses-cards">
    <masonry :cols="{default: 3, 1000: 2, 700: 1}" :gutter="{default: '30px', 700: '20px'}">
      <div v-for="(course, index) in courses" :key="index">
        <!-- Course card -->
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <!-- Course name -->
            <router-link :to="{ name: (course.role || 'staff'), params: { course: course._id, slug: school.slug } }" class="block text-ellipsis">
              <strong>{{course.name}}</strong>
              <lms-icon class="ml-5" :model="course"/>
            </router-link>
          </div>

          <el-row>
            <el-col :span="12">
              <!-- Course created by -->
              <div v-if="course.createdBy" class="text-ellipsis">
                <thumbnail :model="course.createdBy" class="thumb-user thumb-24"/>
                {{course.createdBy.name}}
              </div>
            </el-col>
            <el-col :span="12">
            <!-- Course created date -->
              <div class="pull-right">
                <div class="text-muted text-ellipsis font-12">
                  {{ fromNow(course.createdDate) }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </div>
    </masonry>
  </div>
</template>

<script>
import moment from 'moment'
import LmsIcon from '@/edpack-web/components/LmsIcon'

export default {
  name: 'CoursesCards',
  props: ['courses'],
  components: { LmsIcon },

  data () {
    return {
      school: this.$store.state.school
    }
  },

  methods: {
    fromNow (date) { return moment(date).fromNow(true) }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
