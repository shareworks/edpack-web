<template>
  <div>
    <affix class="sticky-bar" relative-element-selector="#sticky-content" :offset="{ top: 148, bottom: -1000 }">
      <el-row type="flex" justify="center" align="middle">
        <el-col :xs="8" :sm="12">
          <div v-if="multipleSelection.length">
            <!-- Remove courses -->
            <el-badge :value="multipleSelection.length">
              <el-button type="danger" plain size="medium" @click="confirmRemove" :loading="submitting" class="button-square-xs">
                <i class="icon-delete"></i>
                <span class="hidden-xs hidden-sm">{{ $t('SW_REMOVE') }}</span>
              </el-button>
            </el-badge>
            <!-- Archive courses -->
            <el-badge :value="multipleSelection.length" v-if="statusFilter !== 'archived'">
              <el-button type="warning" plain size="medium" @click="confirmArchive" class="button-square-xs ml-5">
                <i class="icon-box"></i>
                <span class="hidden-xs hidden-sm">{{ $tc('SW_ARCHIVE') }}</span>
              </el-button>
            </el-badge>
            <!-- Clear selection -->
            <el-button type="text" size="medium" class="ml-10" @click="selectionChange">
              <i class="icon-clear"></i>
              <span class="hidden-xs hidden-sm">{{ $t('SW_CANCEL') }}</span>
            </el-button>
          </div>

          <div v-else-if="user.role !== 'student'">
            <!-- Create courses manually -->
            <el-button v-if="school.enableManualCourses" type="primary" plain @click="dialogCourse = true" size="medium" class="button-square-xs">
              <i class="icon-add"></i>
              <span class="hidden-xs">{{ $t('SW_CREATE_COURSE') }}</span>
            </el-button>

            <!-- Total courses found -->
            <span v-show="status !== 'loading' || tableData.length" class="hidden-xs hidden-sm ml-10 line-height-38">
              <template>{{ total }} {{ $tc('SW_COURSE', total).toLowerCase() }}</template>
            </span>
          </div>
        </el-col>

        <el-col :xs="16" :sm="12" class="course-header-filter">

          <el-row>
            <el-col :span="6">
              <!-- Select a faculty -->
              <el-select v-model="facultyFilter" clearable class="mr-10" :placeholder="$t('SW_FACULTY', [school.terminology.faculty[lang]])" size="medium" @change="changeFilter" v-if="school.faculties.length > 1 && !cards">
                <el-option v-for="item in school.faculties" :key="item._id" :label="item[lang]" :value="item._id"></el-option>
              </el-select>
            </el-col>

            <el-col :span="14">
              <!-- Search input -->
              <el-input :name="$t('SW_SEARCH_COURSES')" v-model="searchText" size="medium" clearable :placeholder="$t('SW_SEARCH_COURSES')" :class="{'input-with-select': user.role !== 'student'}">
                <el-select v-model="statusFilter" slot="prepend" @change="changeFilter" v-if="user.role !== 'student'">
                  <el-option v-for="item in statusOptions" :key="item" :label="$t('SW_' + item.toUpperCase())" :value="item"></el-option>
                </el-select>
              </el-input>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </affix>
    <div class="bar-placeholder"></div>

    <div class="mt-20" id="sticky-content">
      <!-- Course cards -->
      <courses-cards v-show="tableData.length" v-if="cards" :courses="tableData"></courses-cards>

      <!-- Course table -->
      <courses-table ref="coursesTableInParent" :tableData="tableData" :cards="cards" :selection-change="selectionChange"
                     :order="order" :sort="sort" :sortChange="sortChange" :customCounts="customCounts"/>
    </div>

    <mugen-scroll :handler="getCourses" :handle-on-mount="false" :should-handle="status === 'incomplete'"></mugen-scroll>

    <table-status :status="status" :noneText="$t('SW_NO_COURSES_FOUND')" @clearSearch="searchText = ''"></table-status>

    <div v-if="status === 'none' && statusFilter === 'active'" class="mt-30">
      <!-- Notify students there is nothing to do yet -->
      <el-alert type="info" v-if="user.role === 'student'"  show-icon :title="$t('SW_STUDENT_HOME_ALERT')">
        {{ $t('SW_STUDENT_HOME_ALERT_TEXT', [appName]) }}
      </el-alert>

      <!-- Notify teachers they need to create a course to get started -->
      <el-alert type="info" v-else show-icon :title="$t('SW_STUDENT_HOME_ALERT')">
        {{ $t('SW_STAFF_HOME_ALERT_TEXT', [appName]) }}
      </el-alert>
    </div>

    <!-- Create course dialog -->
    <el-dialog :title="$t('SW_CREATE_COURSE')" append-to-body :visible.sync="dialogCourse">
      <create-course :closeDialog="closeDialog" v-if="dialogCourse"></create-course>
    </el-dialog>
  </div>
</template>

<script>
import config from 'config'
import debounce from 'lodash/debounce'
import TableStatus from '../TableStatus'
import CreateCourse from '../CreateCourse'
import CoursesCards from '../CoursesCards'
import CoursesTable from '../CoursesTable'

export default {
  name: 'Courses',
  props: ['member', 'customCounts', 'cards', 'hideCreateCourseButton'],
  components: { CoursesCards, CreateCourse, TableStatus, CoursesTable },

  data () {
    return {
      appName: config.name,
      status: false,
      searchText: this.$route.query.query || '',
      sort: 'createdDate',
      order: 'ascending',
      tableData: [],
      skip: false,
      total: 0,
      multipleSelection: [],
      dialogCourse: false,
      school: this.$store.state.school,
      user: this.$store.state.user,
      lang: this.$store.state.lang,
      statusOptions: ['active', 'inactive', 'archived'],
      statusFilter: this.$route.query.statusFilter || 'active',
      submitting: false,
      facultyFilter: this.$route.query.context || ''
    }
  },

  watch: {
    searchText: debounce(function () {
      const query = { query: this.searchText, filter: this.statusFilter, faculty: this.facultyFilter }
      this.$router.replace({ params: { slug: this.school.slug, mode: 'courses' }, query })
    }, 400),
    '$route' () {
      this.selectionChange()
      this.getCourses(true)
    }
  },

  mounted () {
    this.getCourses()
  },

  methods: {
    getCourses (refresh) {
      if (this.status === 'loading') return
      this.status = 'loading'

      const params = {
        amount: 20,
        member: this.member,
        sort: this.sort,
        status: this.statusFilter,
        order: this.order === 'ascending' ? (this.sort === 'name' ? '1' : '-1') : (this.sort === 'name' ? '-1' : '1')
      }

      if (refresh) {
        this.tableData = []
        this.skip = false
      }

      // Add elements on existing elements
      if (this.skip) params.skip = this.skip

      // Filter if there is search text
      if (this.searchText) params.filter = this.searchText

      // Show courses within a faculty
      if (this.$route.query.context && this.$route.query.context !== 'school') {
        params.faculty = this.$route.query.context
      }

      this.$http.get('courses', { params })
        .then((res) => {
          this.tableData = this.tableData.concat(res.data.list)
          this.status = res.data.total ? (res.data.done ? 'done' : 'incomplete') : (this.searchText ? 'noResults' : 'none')
          this.skip = res.data.skip
          this.total = res.data.total
        })
        .catch(() => {
          this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') })
          this.status = 'error'
        })
    },
    closeDialog (refresh) {
      this.dialogCourse = false
      if (refresh) {
        this.searchText = ''
        this.statusFilter = 'active'
        this.selectionChange()
        this.getCourses(true)
      }
    },
    selectionChange (val) {
      if (Array.isArray(val)) {
        if (((val.length - this.multipleSelection.length) || 0) > 1) {
          if (val.length === this.total) this.$message({ message: this.$i18n.t('SW_ALL_SELECTED_COURSES'), type: 'success' })
          else this.$message({ message: this.$i18n.t('SW_SELECTED_MULTIPLE_COURSES', [val.length, this.total]), type: 'success' })
        }
        this.multipleSelection = val
        return
      }

      this.multipleSelection = []
      if (this.$refs?.coursesTableInParent?.$refs?.coursesTable) {
        this.$refs.coursesTableInParent.$refs.coursesTable.clearSelection()
      }
    },
    confirmArchive () {
      this.$confirm(this.$i18n.tc('SW_ARCHIVE_COURSES_CONFIRM', this.multipleSelection.length), this.$i18n.tc('SW_ARCHIVE_COURSE', this.multipleSelection.length), {
        confirmButtonText: this.$i18n.t('SW_ARCHIVE'),
        cancelButtonText: this.$i18n.t('SW_CANCEL'),
        beforeClose: (action, instance, done) => {
          if (action !== 'confirm') return done()
          instance.confirmButtonLoading = true
          this.archiveCourses().then(() => {
            instance.confirmButtonLoading = false
            done()
          })
        }
      })
    },
    confirmRemove () {
      this.$confirm(this.$i18n.tc('SW_DELETE_COURSES_CONFIRM', this.multipleSelection.length), this.$i18n.tc('SW_DELETE_COURSES', this.multipleSelection.length), {
        confirmButtonText: this.$i18n.t('SW_DELETE'),
        cancelButtonText: this.$i18n.t('SW_CANCEL'),
        beforeClose: (action, instance, done) => {
          if (action !== 'confirm') return done()
          instance.confirmButtonLoading = true
          this.removeCourses().then(() => {
            instance.confirmButtonLoading = false
            done()
          })
        }
      })
    },
    removeCourses () {
      this.submitting = true
      const courses = this.multipleSelection.map(course => course._id)

      return this.$http.delete('courses', { params: { courses } })
        .then(() => {
          this.$message({ message: this.$i18n.tc('SW_COURSES_REMOVED', this.multipleSelection.length), type: 'success' })
          this.removeFromTable(courses)
          this.selectionChange()
          this.skip = this.skip - courses.length
          this.total = this.total - courses.length
        })
        .catch(() => { this.$message({ message: this.$i18n.t('SW_REMOVE_UNSUCCESSFUL'), type: 'error' }) })
        .finally(() => { this.submitting = false })
    },
    removeFromTable (courses) {
      this.tableData = this.tableData.filter(course => !courses.find(_id => course._id === _id))
      if (this.tableData.length === 0) this.status = 'none'
      this.$emit('refreshTable')
    },
    archiveCourses () {
      this.submitting = true
      const courses = this.multipleSelection.map(course => course._id)

      return this.$http.put('courses/status', {}, { params: { courses, status: 'archived' } })
        .then(() => {
          this.$message({ message: this.$i18n.t('SW_COURSES_ARCHIVED'), type: 'success' })
          this.removeFromTable(courses)
          this.selectionChange()
          this.skip = this.skip - courses.length
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.submitting = false })
    },
    changeFilter () {
      const route = { params: { slug: this.school.slug, mode: 'courses' }, query: { query: this.searchText, filter: this.statusFilter, context: this.facultyFilter } }
      this.$router.push(route)
    },
    sortChange (val) {
      if (val.prop === this.sort && val.order === this.order) return
      this.sort = val.prop
      this.order = val.order
      if (this.status !== 'done') this.getCourses(true)
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
