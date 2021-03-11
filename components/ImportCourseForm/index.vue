<template>
  <div>
    <el-form-item :label="$t('SW_USER_IMPORT_SOURCE')" v-if="lms" required>
    <!-- Choose import source -->
      <p class="form-help-text">
        {{$t('SW_USER_IMPORT_SOURCE_TEXT')}}
        <el-popover placement="top-start" width="400" trigger="click" :content="$t('SW_USER_IMPORT_SOURCE_HELP')">
          <a class="cursor-pointer" slot="reference"><i class="icon-question question-circle question-pop ml-5"/></a>
        </el-popover>
      </p>
      <!-- Choose import type -->
      <el-radio-group :disabled="disabledEdit" v-model="form.lmsImportType" size="small" class="pull-left" @change="handleImportType">
        <el-radio-button label="courseUsers">{{ $t('SW_COURSE_STUDENTS') }}</el-radio-button>
        <el-radio-button label="courseGroupSets">{{ $t('SW_COURSE_GROUP_SETS') }}</el-radio-button>
        <el-radio-button label="courseSections">{{ $t('SW_COURSE_SECTIONS') }}</el-radio-button>
      </el-radio-group>

      <div class="inline ml-10 vertical-top mt-5 normal-line-height" v-if="lms && lmsCourse && form.lmsImportType === 'courseUsers'">
        <span class="text-muted mr-5">{{$t('SW_COURSE_HAS')}}</span>
        <el-tag size="mini">{{ lmsCourse.totalStudents }} {{ $tc('SW_STUDENT', lmsCourse.totalStudents).toLowerCase() }}</el-tag>
      </div>
    </el-form-item>

    <!-- Group categories -->
    <div v-if="lms && form.lmsImportType === 'courseGroupSets'" class="mb-20">
      <el-form-item v-if="lmsGroupSets.length && form.canvas.groupCategories && !loading" :label="$t('SW_AVAILABLE_GROUPS')" required>
        <p class="form-help-text">{{$t('SW_AVAILABLE_GROUP_SETS_TEXT')}}</p>
        <el-checkbox-group :disabled="disabledEdit" v-model="form.canvas.groupCategories">
          <div v-for="(group, index) in lmsGroupSets" :key="index">
            <el-checkbox class="text-ellipsis" :label="group" :key="group.id">
              {{ group.name }} <el-tag size="mini" class="no-bold">{{ group.membersCount }} {{ $tc('SW_STUDENT', group.membersCount).toLowerCase() }}</el-tag>
            </el-checkbox>
          </div>
        </el-checkbox-group>
        <span class="text-muted mt-10" v-if="!loading && !lmsGroupSets.length">{{ $t('SW_NO_GROUP_CATEGORIES') }}</span>
      </el-form-item>
    </div>

    <!-- Course sections -->
    <div v-if="lms && form.lmsImportType === 'courseSections'" class="mb-20">
      <el-form-item v-if="lmsCourseSections.length && form.canvas.courseSections && !loading" :label="$t('SW_AVAILABLE_COURSE_SECTIONS')" required>
        <p class="form-help-text">{{$t('SW_AVAILABLE_COURSE_SECTIONS_TEXT')}}</p>
        <el-checkbox-group :disabled="disabledEdit" v-model="form.canvas.courseSections">
          <div v-for="(section, index) in lmsCourseSections" :key="index">
            <el-checkbox class="text-ellipsis" :label="section" :key="section.id">
              <span> {{ section.name }} <el-tag size="mini" class="no-bold">{{ section.totalStudents }} {{ $tc('SW_STUDENT', section.totalStudents).toLowerCase() }}</el-tag></span>
            </el-checkbox>
          </div>
        </el-checkbox-group>
        <span class="text-muted mt-10" v-if="!loading && !lmsCourseSections.length">{{ $t('SW_NO_COURSE_SECTIONS') }}</span>
      </el-form-item>
    </div>
  </div>
</template>

<script>
import getLmsType from '../../utils/get-lms-type'

export default {
  name: 'ImportCourseForm',
  props: ['form', 'lmsCourse', 'loading'],
  data () {
    return {
      lms: getLmsType(this.$store.state.course),
      lmsGroupSets: [],
      lmsCourseSections: [],
      requestedCourseSections: false,
      disabledEdit: !this.form.isNew,
      requestedCourseGroupSets: false,
      course: this.$store.state.course
    }
  },

  mounted () {
    console.log('this.form.lmsImportType', this.form.lmsImportType)
    if (this.form.isNew) this.handleImportType()
  },

  methods: {
    handleImportType () {
      if (!this.lms) return

      if (this.form.lmsImportType === 'courseGroupSets' && !this.requestedCourseGroupSets) this.getLMSGroupSets(this.lms)
      if (this.form.lmsImportType === 'courseSections' && !this.requestedCourseSections) this.getLMSCourseSections(this.lms)
    },
    getLMSGroupSets (lms) {
      if (this.loading) return
      this.$emit('setLoading', true)

      this.$http.get(`courses/${this.course._id}/${lms}/group-categories`, { params: { includeGroups: true } })
        .then((res) => {
          this.lmsGroupSets = res.data.list
          this.requestedCourseGroupSets = true
          this.cleanSelectedGroupCategories()
        })
        .finally(() => { this.$emit('setLoading', false) })
    },
    getLMSCourseSections (lms) {
      if (this.loading) return
      this.$emit('setLoading', true)

      this.$http.get(`courses/${this.course._id}/${lms}/course-sections`)
        .then((res) => {
          this.lmsCourseSections = res.data.list
          this.requestedCourseSections = true
          this.cleanSelectedCourseSections()
        })
        .finally(() => { this.$emit('setLoading', false) })
    },

    cleanSelectedGroupCategories () {
      this.form.canvas.groupCategories = []
      if (this.lmsGroupSets.length === 1) {
        this.form.canvas.groupCategories = this.lmsGroupSets
      }
    },

    cleanSelectedCourseSections () {
      this.form.canvas.courseSections = []
      if (this.lmsCourseSections.length === 1) {
        this.form.canvas.courseSections = this.lmsCourseSections
      }
    }
  }
}
</script>
