<template>
  <div>
    <affix class="sticky-bar" relative-element-selector="#sticky-content" :offset="{ top: 148, bottom: -1000 }">
      <el-row type="flex" justify="center" align="middle">
        <el-col :xs="11" :sm="16">
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

          <div v-else-if="school.role !== 'student'">
            <!-- Create courses manually v-show="school.manualCourses" -->
            <el-button type="primary" plain @click="dialogCourse = true" size="medium" class="button-square-xs">
              <i class="icon-add"></i>
              <span class="hidden-xs">{{ $t('SW_CREATE_COURSE') }}</span>
            </el-button>

            <!-- Total courses found -->
            <span v-show="status !== 'loading' || tableData.length" class="hidden-xs hidden-sm ml-10 line-height-38">
              {{ total }} {{ $tc('SW_COURSE', total).toLowerCase() }}
            </span>
          </div>
        </el-col>

        <!-- Search input -->
        <el-col :xs="13" :sm="8">
          <el-input v-model="searchText" size="medium" clearable :placeholder="$t('SW_SEARCH_COURSES')" :class="{'input-with-select': school.role !== 'student'}">
            <el-select v-model="statusFilter" slot="prepend" @change="changeFilter" v-if="school.role !== 'student'">
              <el-option v-for="item in statusOptions" :key="item" :label="$t('SW_' + item.toUpperCase())" :value="item"></el-option>
            </el-select>
          </el-input>
        </el-col>
      </el-row>
    </affix>
    <div class="bar-placeholder"></div>

    <div class="mt-20" id="sticky-content">
      <!-- Course cards -->
      <courses-cards v-show="tableData.length" v-if="viewMode === 'cards'" :courses="tableData"></courses-cards>

      <!-- Course table -->
      <el-table v-show="tableData.length" v-if="viewMode === 'table'" row-key="_id" ref="coursesTable" :data="tableData" @sort-change="sortChange"
                @selection-change="selectionChange" :default-sort="{prop: this.sort, order: this.order}">
        <!-- Expand -->
        <el-table-column type="expand" width="30">
          <template slot-scope="props">
            <el-row type="flex">
              <el-col :span="12">
                <p>
                  <strong class="mr-5">{{ $t('SW_NAME') }}</strong>
                  {{ props.row.name }}
                </p>
                <p v-if="props.row.counts">
                  <strong class="mr-5">{{ $tc('SW_STAFF', 2) }}</strong>
                  <i class="icon-user"></i>
                  {{ props.row.counts.staff || 0 }}
                </p>
              </el-col>
              <el-col :span="12">
                <p v-if="props.row.canvas && props.row.canvas.id">
                  <strong class="mr-5">{{ $t('SW_CANVAS_ID') }}</strong>
                  {{ props.row.canvas.id }}
                </p>
                <p>
                  <strong class="mr-5">{{ $t('SW_COURSE_ID') }}</strong> {{ props.row._id }}
                </p>
                <p v-if="props.row.createdBy">
                  <strong class="mr-5">{{ $t('SW_CREATED_BY') }}</strong>
                  <thumbnail :model="props.row.createdBy" class="thumb-user thumb-24"></thumbnail>
                  {{props.row.createdBy.name}}
                  <span class="hidden-xs">
                  (<a :href="'mailto:' + props.row.createdBy.email" target="_blank">{{ props.row.createdBy.email }}</a>)
                </span>
                </p>
                <p v-else>
                  <strong class="mr-5">{{ $t('SW_CREATED_BY') }}</strong>
                  <span class="text-muted">{{ $t('SW_UNKNOWN') }}</span>
                </p>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- Selection checkboxes -->
        <el-table-column type="selection" reserve-selection width="35"></el-table-column>
        <!-- Course name -->
        <el-table-column property="name" :label="$tc('SW_COURSE', 1)" min-width="180" sortable :sort-method="sortCaseInsensitive">
          <template slot-scope="props">
            <router-link :to="{ name: (props.row.role || 'staff'), params: { course: props.row._id, slug: school.slug } }" class="block text-ellipsis">
              <strong v-if="props.row.name">{{ props.row.name }}</strong>
              <span v-else>-</span>
              <lms-icon :model="props.row"></lms-icon>
            </router-link>
          </template>
        </el-table-column>
        <!-- Active / inactive -->
        <el-table-column property="role" :label="$t('SW_STATUS')" min-width="80">
          <template slot-scope="props">
            <span class="text-muted" v-if="props.row.status === 'inactive'">{{ $t('SW_INACTIVE') }}</span>
            <span class="text-success" v-else-if="props.row.status === 'active'">{{ $t('SW_ACTIVE') }}</span>
            <span class="text-warning" v-else>{{ $t('SW_ARCHIVED') }}</span>
          </template>
        </el-table-column>
        <!-- Student count -->
        <el-table-column property="counts.students" :label="$tc('SW_STUDENT', 2)" width="140">
          <template slot-scope="props">
            <i class="icon-user"></i>
            {{ props.row.counts && props.row.counts.students || 0 | numeral('0a') }}
          </template>
        </el-table-column>
        <!-- Custom counts -->
        <el-table-column v-for="customCount in customCounts" :key="customCount.type" :property="'counts.' + customCount.type" :label="$t('SW_' + customCount.type.toUpperCase())" width="120" sortable>
          <template slot-scope="props">
            <i :class="customCount.icon"></i>
            {{ props.row.counts && props.row.counts[customCount.type] || 0 | numeral('0a') }}
          </template>
        </el-table-column>
        <!-- User role -->
        <el-table-column property="role" :label="$t('SW_YOUR_ROLE')" min-width="80">
          <template slot-scope="props">
            <span v-if="props.row.role">{{ $tc('SW_' + props.row.role.toUpperCase(), 1 )}}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <!-- Faculty -->
        <el-table-column v-if="school.faculties && school.faculties.length" property="faculty" :label="school.terminology.faculty[lang]" min-width="100">
          <template slot-scope="props">
            <div v-if="props.row.faculty" class="text-ellipsis">{{ getFaculty(props.row.faculty) }}</div>
            <div v-else class="text-muted">-</div>
          </template>
        </el-table-column>
        <!-- Created date -->
        <el-table-column property="createdDate" :formatter="dateFormatter" :sort-method="sortCreatedDate" :label="$t('SW_CREATED_DATE')" min-width="160" sortable></el-table-column>
      </el-table>
    </div>

    <mugen-scroll :handler="getCourses" :handle-on-mount="false" :should-handle="status === 'incomplete'"></mugen-scroll>

    <table-status :status="status" :noneText="$t('SW_NO_COURSES_FOUND')" @clearSearch="searchText = ''"></table-status>

    <div v-if="status === 'none' && statusFilter === 'active'" class="mt-30">
      <!-- Notify students there is nothing to do yet -->
      <el-alert type="info" v-if="school.role === 'student'"  show-icon :title="$t('SW_STUDENT_HOME_ALERT')">
        {{ $t('SW_STUDENT_HOME_ALERT_TEXT') }}
      </el-alert>

      <!-- Notify teachers they need to create a course to get started -->
      <el-alert type="info" v-else show-icon :title="$t('SW_STUDENT_HOME_ALERT')">
        {{ $t('SW_STAFF_HOME_ALERT_TEXT') }}
      </el-alert>
    </div>

    <!-- Create course dialog -->
    <el-dialog :title="$t('SW_CREATE_COURSE')" append-to-body :visible.sync="dialogCourse">
      <create-course :closeDialog="closeDialog" v-if="dialogCourse"></create-course>
    </el-dialog>
  </div>
</template>

<script>
import moment from 'moment'
import LmsIcon from '../LmsIcon'
import debounce from 'lodash/debounce'
import TableStatus from '../TableStatus'
import CreateCourse from '../CreateCourse'
import dateSorter from '../../utils/date-sorter'
import sortCaseInsensitive from '../../utils/sort-case-insensitive'
import CoursesCards from '@/edpack-web/components/CoursesCards'

export default {
  name: 'CoursesTable',
  props: ['member', 'customCounts'],
  components: { CoursesCards, CreateCourse, LmsIcon, TableStatus },

  data () {
    return {
      viewMode: this.$route.name === 'home' ? 'cards' : 'table',
      status: false,
      searchText: this.$route.query.query || '',
      sort: 'createdDate',
      order: 'ascending',
      tableData: [],
      skip: false,
      total: 0,
      multipleSelection: [],
      school: this.$store.state.school,
      dialogCourse: false,
      user: this.$store.state.user,
      lang: this.$store.state.lang,
      statusOptions: ['active', 'inactive', 'archived'],
      statusFilter: this.$route.query.filter || 'active',
      submitting: false
    }
  },

  watch: {
    searchText: debounce(function () {
      this.$router.replace({ query: { query: this.searchText, filter: this.statusFilter } })
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
      if (this.$refs.coursesTable) this.$refs.coursesTable.clearSelection()
    },
    confirmArchive () {
      this.$confirm(this.$i18n.tc('SW_ARCHIVE_COURSES_CONFIRM', this.multipleSelection.length), this.$i18n.tc('SW_ARCHIVE_COURSE', this.multipleSelection.length), {
        confirmButtonText: this.$i18n.t('SW_ARCHIVE'),
        cancelButtonText: this.$i18n.t('SW_CANCEL'),
        beforeClose: (action, instance, done) => {
          if (action !== 'confirm') return done()
          instance.confirmButtonLoading = true
          this.archiveCourses().then(res => {
            instance.confirmButtonLoading = false
            done()
          })
        }
      })
    },
    confirmRemove () {
      this.$confirm(this.$i18n.t('SW_DELETE_COURSES_CONFIRM'), this.$i18n.tc('SW_DELETE_COURSE', this.multipleSelection.length), {
        confirmButtonText: this.$i18n.t('SW_DELETE'),
        cancelButtonText: this.$i18n.t('SW_CANCEL'),
        beforeClose: (action, instance, done) => {
          if (action !== 'confirm') return done()
          instance.confirmButtonLoading = true
          this.removeCourses().then(res => {
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
          this.$message({ message: this.$i18n.t('SW_COURSES_REMOVED'), type: 'success' })
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
    getFaculty (id) {
      let faculty = null

      if (this.school.faculties) {
        this.school.faculties.find(fac => { if (fac._id === id) { faculty = fac[this.lang] } })
      } else {
        faculty = ''
      }

      return faculty
    },
    sortChange (val) {
      if (val.prop === this.sort && val.order === this.order) return
      this.sort = val.prop
      this.order = val.order
      if (this.status !== 'done') this.getCourses(true)
    },
    changeFilter (filter) { this.$router.replace({ query: { query: this.searchText, filter: filter } }) },
    sortCreatedDate (a, b) { return dateSorter(a.createdDate, b.createdDate) },
    sortCaseInsensitive (a, b) { return sortCaseInsensitive(a.name, b.name) },
    dateFormatter (row, column, value) { return moment(value).fromNow() }
  }
}
</script>
