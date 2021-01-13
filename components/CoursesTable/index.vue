<template>
  <el-table v-show="tableData.length" v-if="!cards" row-key="_id" ref="coursesTable" :data="tableData" @sort-change="sortChange"
            @selection-change="selectionChange" :default-sort="{prop: this.sort, order: this.order}">

    <!-- Expand -->
    <el-table-column type="expand" width="30">
      <template slot-scope="props">
        <el-row type="flex">
          <el-col :span="12">
            <p>
              <!-- Name -->
              <strong class="mr-5">{{ $t('SW_NAME') }}</strong>
              {{ props.row.name }}
            </p>
            <p v-if="props.row.counts">
              <!-- Counts -->
              <strong class="mr-5">{{ $tc('SW_STAFF', 2) }}</strong>
              <i class="icon-user"></i>
              {{ props.row.counts.staff || 0 }}
            </p>
          </el-col>
          <el-col :span="12">
            <p v-if="props.row.canvas && props.row.canvas.id">
              <!-- Canvas Id -->
              <strong class="mr-5">{{ $t('SW_CANVAS_ID') }}</strong>
              {{ props.row.canvas.id }}
            </p>
            <p>
              <!-- Course Id -->
              <strong class="mr-5">{{ $t('SW_COURSE_ID') }}</strong> {{ props.row._id }}
            </p>
            <p v-if="props.row.createdBy">
              <!-- Created by -->
              <strong class="mr-5">{{ $t('SW_CREATED_BY') }}</strong>
              <thumbnail :model="props.row.createdBy" class="thumb-user thumb-24"/>
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
    <el-table-column type="selection" reserve-selection width="35"/>

    <!-- Course name -->
    <el-table-column property="name" :label="$tc('SW_COURSE', 1)" min-width="180" sortable :sort-method="sortCaseInsensitive">
      <template slot-scope="props">
        <router-link :to="{ name: (props.row.role || 'staff'), params: { course: props.row._id, slug: school.slug } }" class="block text-ellipsis">
          <lms-icon class="mr-5" :model="props.row"/>
          <strong v-if="props.row.name">{{ props.row.name }}</strong>
          <span v-else>-</span>
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
        <i class="icon-user"/>
        {{ props.row.counts && props.row.counts.students || 0 | numeral('0a') }}
      </template>
    </el-table-column>

    <!-- Custom counts -->
    <el-table-column class-name="update-cell-style" v-for="customCount in customCounts" :key="customCount.type" :property="'counts.' + customCount.type" :label="$tc('SW_' + customCount.type.toUpperCase(), 2)" width="120" sortable>
      <template slot-scope="props">
        <i :class="customCount.icon"/>
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
    <el-table-column v-if="school.faculties && school.faculties.length" property="faculty" :label="school.terminology.faculty[lang]" min-width="140">
      <template slot-scope="props">
        <div v-if="props.row.faculty" class="text-ellipsis">{{ getFaculty(props.row.faculty) }}</div>
        <div v-else class="text-muted">-</div>
      </template>
    </el-table-column>

    <!-- Created date -->
    <el-table-column property="createdDate" :formatter="dateFormatter" :sort-method="sortCreatedDate" :label="$t('SW_CREATED_DATE')" min-width="160" sortable/>
  </el-table>
</template>

<script>
import moment from 'moment'
import config from 'config'
import LmsIcon from '../LmsIcon'
import dateSorter from '@/edpack-web/utils/date-sorter'
import sortCaseInsensitive from '@/edpack-web/utils/sort-case-insensitive'

export default {
  name: 'CoursesTable',
  components: { LmsIcon },
  props: ['tableData', 'cards', 'selectionChange', 'order', 'sort', 'sortChange'],
  data () {
    return {
      lang: this.$store.state.lang,
      school: this.$store.state.school,
      customCounts: config.courseCounts
    }
  },
  methods: {
    getFaculty (id) {
      let faculty = null

      if (this.school.faculties) {
        this.school.faculties.find(fac => { if (fac._id === id) { faculty = fac[this.lang] } })
      } else {
        faculty = ''
      }

      return faculty
    },
    sortCaseInsensitive (a, b) { return sortCaseInsensitive(a.name, b.name) },
    sortCreatedDate (a, b) { return dateSorter(a.createdDate, b.createdDate) },
    dateFormatter (row, column, value) { return moment(value).fromNow() }
  }
}
</script>
