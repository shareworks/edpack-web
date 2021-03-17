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
      <el-radio-group :disabled="disabledEdit" v-model="form.lmsImportType" size="small" class="pull-left mb-5" @change="handleImportType">
        <el-radio-button label="courseUsers">{{ $t('SW_COURSE_STUDENTS') }}</el-radio-button>
        <el-radio-button label="courseGroupSets">{{ $t('SW_COURSE_GROUP_SETS') }}</el-radio-button>
        <el-radio-button label="courseSections" v-if="lms === 'canvas'">{{ $t('SW_COURSE_SECTIONS') }}</el-radio-button>
      </el-radio-group>

      <div class="inline ml-10 vertical-top mt-5 normal-line-height" v-if="lms && lmsCourse && form.lmsImportType === 'courseUsers'">
        <span class="text-muted mr-5">{{$t('SW_COURSE_HAS')}}</span>
        <el-tag size="mini" v-if="lmsCourse.totalStudents">{{ lmsCourse.totalStudents }} {{ $tc('SW_STUDENT', lmsCourse.totalStudents).toLowerCase() }}</el-tag>
      </div>
    </el-form-item>

    <!-- Group categories -->
    <div v-if="lms && form.lmsImportType === 'courseGroupSets'" class="mb-20">
      <el-form-item v-if="lmsGroupSets.length && form.canvas.groupCategories && !loading" :label="$t('SW_AVAILABLE_GROUPS')" required>
        <p class="form-help-text">{{$t('SW_AVAILABLE_GROUP_SETS_TEXT')}}</p>
        <el-checkbox-group :disabled="disabledEdit" v-model="form.canvas.groupCategories">
          <div v-for="(group, index) in lmsGroupSets" :key="index">
            <el-checkbox class="text-ellipsis" :label="group" :key="group.id">
              {{ group.name }} <el-tag size="mini" class="no-bold" v-if="group.membersCount">{{ group.membersCount }} {{ $tc('SW_STUDENT', group.membersCount).toLowerCase() }}</el-tag>
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
              {{ section.name }} <el-tag size="mini" class="no-bold" v-if="section.totalStudents">{{ section.totalStudents }} {{ $tc('SW_STUDENT', section.totalStudents).toLowerCase() }}</el-tag>
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
  props: ['form', 'loading'],
  data () {
    return {
      lms: getLmsType(this.$store.state.course),
      lmsCourse: false,
      lmsGroupSets: [],
      lmsCourseSections: [],
      disabledEdit: !this.form.isNew,
      course: this.$store.state.course
    }
  },

  mounted () {
    this.handleImportType()
  },

  methods: {
    handleImportType () {
      if (!this.lms) return
      if (this.form.lmsImportType === 'courseUsers') this.getLMSCourse()
      if (this.form.lmsImportType === 'courseGroupSets') this.getLMSGroupSets()
      if (this.form.lmsImportType === 'courseSections') this.getLMSCourseSections()
    },

    getLMSCourse () {
      if (this.loading) return
      this.$emit('setLoading', true)

      this.$http.get(`courses/${this.course._id}/${this.lms}/course`)
        .then((res) => {
          this.lmsCourse = res.data.list[0]
        })
        .finally(() => { this.$emit('setLoading', false) })
    },

    getLMSGroupSets () {
      if (this.loading) return
      this.$emit('setLoading', true)

      this.$http.get(`courses/${this.course._id}/${this.lms}/group-categories`, { params: { includeGroups: true } })
        .then((res) => {
          this.lmsGroupSets = res.data.list
          this.cleanSelectedGroupCategories()
        })
        .finally(() => { this.$emit('setLoading', false) })
    },
    getLMSCourseSections () {
      if (this.loading) return
      this.$emit('setLoading', true)

      this.$http.get(`courses/${this.course._id}/${this.lms}/course-sections`)
        .then((res) => {
          this.lmsCourseSections = res.data.list
          this.cleanSelectedCourseSections()
        })
        .finally(() => { this.$emit('setLoading', false) })
    },

    cleanSelectedGroupCategories () {
      const selectedGroups = []
      const filteredGroups = []

      this.form.canvas.groupCategories.forEach(group => selectedGroups.push(group.id))

      this.form.canvas.groupCategories = []

      this.lmsGroupSets.forEach(group => {
        if (selectedGroups.includes(group.id)) {
          filteredGroups.push(group)
        }
      })

      this.form.canvas.groupCategories = filteredGroups
    },

    cleanSelectedCourseSections () {
      const selectedSections = []
      const filteredSections = []

      this.form.canvas.courseSections.forEach(section => selectedSections.push(section.id))
      this.form.canvas.courseSections = []

      this.lmsCourseSections.forEach(section => {
        if (selectedSections.includes(section.id)) {
          filteredSections.push(section)
        }
      })

      this.form.canvas.courseSections = filteredSections
    }
  }
}
</script>
