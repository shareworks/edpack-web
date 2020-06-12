<template>
  <div>
    <div class="mb-10"><strong class="mr-5">ID</strong> {{ _id }}</div>

    <div v-if="userCourses && userCourses.length">
      <el-table :data="userCourses" row-key="_id" :default-sort="{prop: 'createdDate', order: 'descending'}">
        <el-table-column property="name" :label="$tc('SW_COURSE', 1)" min-width="180">
          <template slot-scope="scope">
            <router-link :to="{ name: 'staff', params: { course: scope.row._id, slug: school.slug } }" class="block text-ellipsis">
              <span v-if="scope.row.name">{{ scope.row.name }}</span>
              <span v-else>-</span>
              <lms-icon :model="scope.row"></lms-icon>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column property="role" :label="$tc('SW_ROLE', 1)" min-width="110">
          <template slot-scope="scope">
            <span v-if="scope.row.role">{{ $t('SW_' + scope.row.role.toUpperCase() )}}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column property="createdDate" :formatter="dateFormatter" :sort-method="sortCreatedDate" :label="$t('SW_CREATED_DATE')" min-width="140"></el-table-column>
      </el-table>
    </div>
    <div v-else>{{ $t('SW_NO_COURSES_FOUND') }}</div>
  </div>
</template>

<script>
import LmsIcon from '../../components/LmsIcon'
export default {
  name: 'ExpandUser',
  props: ['_id', 'dateFormatter', 'sortCreatedDate'],
  components: { LmsIcon },

  data () {
    return {
      userCourses: [],
      school: this.$store.state.school
    }
  },

  mounted() {
    this.getUserCourses()
  },

  methods: {
    getUserCourses () {
      this.$http.get(`users/${this._id}/courses`)
      .then(res => {
        const result = res.data.list

        // Each course should has availableLms prop
        result.forEach(res => res.availableLms = res.availableLms ? res.availableLms : [])
        this.userCourses = result
      })
      .catch(err => console.log(err))
    },
  }
}
</script>
