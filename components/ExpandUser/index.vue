<template>
  <div>
    <!-- Id -->
    <div class="mb-10" v-if="isAdmin"><strong class="mr-5">ID</strong> {{ _id }}</div>

    <!-- Modified date -->
    <p v-if="user.modifiedDate">
      <strong class="mr-5">{{ $t('SW_MODIFIED_DATE') }}</strong>
      {{ fromNow(user.modifiedDate) }}
      {{ $t('SW_AGO') }}
    </p>

    <!-- Modified by -->
    <p v-if="user.modifiedBy">
      <strong class="mr-5">{{ $t('SW_MODIFIED_BY') }}</strong>
      <thumbnail :model="user.modifiedBy" class="thumb-user thumb-24"/>
      {{user.modifiedBy.name}} <span class="hidden-xs">(<a :href="'mailto:' + user.modifiedBy.email" target="_blank">{{ user.modifiedBy.email }}</a>)</span>
    </p>

    <!-- Faculties Manager -->
    <div v-if="user.faculties.length" class="mb-10">
      <p>
        <strong>{{ $t('SW_FACULTY_MANAGER') }}</strong>
        <el-tag v-for="fac in facultiesManager" class="ml-5" :key="fac">{{ fac }}</el-tag>
      </p>
    </div>

    <!-- User Courses -->
    <div v-if="userCourses && userCourses.length" class="mt-20">
      <el-table :data="userCourses" row-key="_id" :default-sort="{prop: 'createdDate', order: 'descending'}">
        <!-- Course Name -->
        <el-table-column property="name" :label="$tc('SW_COURSE', 1)" min-width="180">
          <template slot-scope="scope">
            <router-link :to="{ name: 'staff', params: { course: scope.row._id, slug: school.slug } }" class="block text-ellipsis">
              <span v-if="scope.row.name">{{ scope.row.name }}</span>
              <span v-else>-</span>
              <lms-icon class="ml-5" :model="scope.row"/>
            </router-link>
          </template>
        </el-table-column>

        <!-- Role -->
        <el-table-column property="role" :label="$tc('SW_ROLE', 1)" min-width="110">
          <template slot-scope="scope">
            <div class="capitalize">
              <span v-if="scope.row.role === 'student'">{{ school.terminology.student[lang].toLowerCase() }}</span>
              <span v-else-if="scope.row.role === 'participant'">{{ school.terminology.student[lang].toLowerCase() }}</span>
              <span v-else-if="scope.row.role === 'staff'">{{ school.terminology.instructor[lang].toLowerCase() }}</span>
              <span v-else-if="scope.row.role === 'assessor'">{{ $tc('SW_ASSESSOR', 1) }}</span>
              <span v-else-if="scope.row.role === 'admin'">{{ $t('SW_ADMIN') }}</span>
              <span v-else>-</span>
            </div>
          </template>
        </el-table-column>

        <!-- Created Date -->
        <el-table-column property="createdDate" :formatter="dateFormatter" :sort-method="sortCreatedDate" :label="$t('SW_CREATED_DATE')" min-width="140"/>
      </el-table>
    </div>

    <!-- No course found -->
    <div class="mt-20" v-else>{{ $t('SW_NO_COURSES_FOUND') }}</div>
  </div>
</template>

<script>
import LmsIcon from '../../components/LmsIcon'
import moment from 'moment'

export default {
  name: 'ExpandUser',
  props: ['_id', 'dateFormatter', 'sortCreatedDate', 'user'],
  components: { LmsIcon },

  data () {
    return {
      userCourses: [],
      lang: this.$store.state.lang,
      school: this.$store.state.school,
      isAdmin: this.$store.state.isAdmin
    }
  },

  computed: {
    facultiesManager () {
      const faculties = this.school.faculties.map(fac => {
        const faculty = this.user.faculties.find(userFaculty => userFaculty._id === fac._id)
        if (faculty) return fac[this.lang]
      })

      return faculties.filter(Boolean)
    }
  },

  mounted () {
    this.getUserCourses()
  },

  methods: {
    fromNow (date) { return moment(date).fromNow(true) },
    getUserCourses () {
      this.$http.get(`users/${this._id}/courses`)
        .then(res => {
          const result = res.data.list
          this.userCourses = result
        })
        .catch(err => console.log(err))
    }
  }
}
</script>
