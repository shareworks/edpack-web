<template>
  <div>
    <p class="mb-20">{{ $t('SW_DIALOG_MANAGE_STAFF_TEXT') }}</p>

    <!-- Table with instructors -->
    <el-table v-if="!loading" v-show="staff.length" @sort-change="sortChange" :data="getTableData" row-key="_id" ref="staffTable">
      <!-- Name -->
      <el-table-column :label="$tc('SW_STAFF', 1)" prop="name" min-width="160">
        <template slot-scope="props">
          <div class="text-ellipsis">
            <thumbnail :model="props.row" class="thumb-user thumb-24 mr-5 hidden-xs hidden-sm"/>
            <strong>{{ props.row.name }}</strong>
            <el-tag size="mini" class="ml-5" type="info" v-if="props.row._id === user._id">{{$t('SW_YOU')}}</el-tag>
          </div>
        </template>
      </el-table-column>

      <!-- Email address -->
      <el-table-column property="email" :label="$tc('SW_EMAIL', 1)" min-width="180">
        <template slot-scope="props">
          <a :href="'mailto:' + props.row.email" target="_blank" class="text-ellipsis">{{ props.row.email }}</a>
        </template>
      </el-table-column>

      <!-- Activity date -->
      <el-table-column sortable property="activityDate" :formatter="dateFormatter" :label="$t('SW_ACTIVITY_DATE')" min-width="140"/>

      <!-- Role -->
      <el-table-column sortable property="role" width="150" :label="$tc('SW_ROLE', 1)">
        <template slot-scope="props">
          <div class="pull-right">
            <el-dropdown trigger="click" @command="handleCommand">
              <el-button size="small" :plain="getRoleButtonType(props.row.role) === 'plain'" :type="props.row.role === 'none' ? '' : 'primary'">
                {{ $t('SW_' + props.row.role.toUpperCase()) }}
                <i class="el-icon-caret-bottom el-icon--right"/>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{instructor: props.row, role: 'owner'}">
                  <span>{{ $t('SW_OWNER') }}</span>
                </el-dropdown-item>
                <el-dropdown-item :command="{instructor: props.row, role: 'viewer'}">
                  <span>{{ $t('SW_VIEWER') }}</span>
                </el-dropdown-item>
                <el-dropdown-item :command="{instructor: props.row, role: 'none'}">
                  <span>{{ $t('SW_NO_ROLE') }}</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- Loading -->
    <spinner v-if="loading"/>

    <!-- Save changes or cancel -->
    <div class="mt-30">
      <el-button type="primary" @click="updateInstructors" :loading="submitting" class="mr-5">
        <strong>{{ $t('SW_SAVE_CHANGES') }}</strong>
      </el-button>
      <el-button @click="closeDialog" type="text">{{ $t('SW_CANCEL') }}</el-button>
    </div>

    <el-pagination class="text-center" background layout="prev, pager, next" :total="total" :page-size="pageSize" @current-change="onPageChange"/>
  </div>
</template>

<script>
import moment from 'moment'
import dateSorter from '../../utils/date-sorter'

export default {
  name: 'ManageAccess',
  props: ['closeDialog', 'evaluation'],

  data () {
    return {
      course: this.$store.state.course,
      school: this.$store.state.school,
      user: this.$store.state.user,
      lang: this.$store.state.lang,
      staff: [],
      loading: false,
      submitting: false,
      pageSize: 5,
      currentPage: 0,
      total: 0,
      noneRole: [],
      viewerRole: [],
      ownerRole: []
    }
  },

  computed: {
    getTableData () {
      const takeValuesFrom = this.pageSize * this.currentPage
      return [...this.staff].splice(takeValuesFrom, this.pageSize)
    }
  },

  mounted () {
    this.getInstructors()
  },

  methods: {
    sortChange (val) {
      if (val.prop === 'activityDate' && val.order === 'ascending') {
        this.staff.sort(this.sortActivityDate)
      } else if (val.prop === 'activityDate' && val.order === 'descending') {
        this.staff.sort(this.sortActivityDate).reverse()
      }

      if (val.prop === 'role' && val.order === 'ascending') {
        this.staff = [...this.ownerRole, ...this.viewerRole, ...this.noneRole]
      } else if (val.prop === 'role' && val.order === 'descending') {
        this.staff = [...this.noneRole, ...this.viewerRole, ...this.ownerRole]
      }
    },
    onPageChange (pageNumber) { this.currentPage = pageNumber - 1 },
    getInstructors () {
      this.loading = true

      this.$http.get('users', { params: { role: 'staff', entity: this.course._id } })
        .then((res) => {
          this.staff = []
          const roleMap = {}

          for (const member of this.evaluation.staff) {
            roleMap[member._id] = member.role
          }

          for (const courseStaff of res.data.list) {
            courseStaff.role = roleMap[courseStaff._id] || 'none'
            this.staff.push(courseStaff)
          }
          this.total = this.staff.length

          this.staff.forEach(user => {
            if (user.role === 'none') this.noneRole.push(user)
            else if (user.role === 'viewer') this.viewerRole.push(user)
            else if (user.role === 'owner') this.ownerRole.push(user)
          })
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.loading = false })
    },
    getRoleButtonType (role) {
      switch (role) {
      case 'owner':
        return 'primary'
      case 'viewer':
        return 'plain'
      default:
        return 'default'
      }
    },
    handleCommand (command) { command.instructor.role = command.role },
    updateInstructors () {
      if (this.submitting) return

      const invitations = []

      // Add course role as staff
      for (const staff of this.staff) {
        invitations.push({
          recipientEmail: staff.email,
          contextId: this.evaluation._id,
          downgrade: true,
          role: staff.role,
          sendEmail: false
        })
      }

      this.submitting = true
      this.$http.post('users/invite', { invitations }, { params: { toSelf: false } })
        .then(() => {
          this.evaluation.staff = this.staff.filter(staff => staff.role !== 'none')
          this.$message({ message: this.$i18n.t('SW_EVALUATION_ROLES_UPDATED'), type: 'success' })
          this.closeDialog()
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.submitting = false })
    },
    sortActivityDate (a, b) { return dateSorter(a.activityDate, b.activityDate) },
    dateFormatter (row, column, value) { return value ? moment(value).fromNow() : this.$i18n.t('SW_INVITE_PENDING') }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
