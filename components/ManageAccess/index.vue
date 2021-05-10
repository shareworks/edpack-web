<template>
  <div>
    <p class="mb-20">{{ $t('SW_DIALOG_MANAGE_STAFF_TEXT') }}</p>

    <!-- Table with instructors -->
    <el-table v-if="!loading && staff.length" :data="dataInStep" row-key="_id" @sort-change="sortChange"
              ref="staffTable" :default-sort="{prop: 'activityDate', order: 'descending'}">
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
              <el-button size="small" :plain="props.row.role !== 'owner'" :type="props.row.role !== 'none' ? 'primary' : 'default'">
                <i v-if="props.row.role !== 'none'" :class="props.row.role === 'owner' ? 'icon-star-full' : 'icon-star-empty'"></i>
                {{ $t('SW_' + props.row.role.toUpperCase()) }}
                <i class="el-icon-caret-bottom el-icon--right"/>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{instructor: props.row, role: 'owner'}">
                  <i class="icon-star-full"></i>
                  <span>{{ $t('SW_OWNER') }}</span>
                </el-dropdown-item>
                <el-dropdown-item :command="{instructor: props.row, role: 'viewer'}">
                  <i class="icon-star-empty"></i>
                  <span>{{ $t('SW_VIEWER') }}</span>
                </el-dropdown-item>
                <el-dropdown-item :command="{instructor: props.row, role: 'none'}">
                  <i class="icon-lock"></i>
                  <span>{{ $t('SW_NO_ROLE') }}</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="block text-center mt-10">
      <el-pagination layout="prev, pager, next" background :page-size="5" :current-page.sync="page" :total="staff.length" @current-change="updateDataInPage"/>
    </div>

    <!-- Loading -->
    <spinner v-if="loading"/>

    <!-- Save changes or cancel -->
    <div class="mt-30">
      <el-button type="primary" @click="updateInstructors" :loading="submitting" class="mr-5">
        <strong>{{ $t('SW_SAVE_CHANGES') }}</strong>
      </el-button>
      <el-button @click="closeDialog" type="text">{{ $t('SW_CANCEL') }}</el-button>
    </div>
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
      page: 1,
      staff: [],
      dataInStep: [],
      loading: false,
      submitting: false
    }
  },

  mounted () {
    this.getInstructors()
  },

  methods: {
    roleSort (ownerStart = true) {
      const owner = []
      const viewer = []
      const none = []

      this.staff.forEach(user => {
        if (user.role === 'owner') owner.push(user)
        if (user.role === 'viewer') viewer.push(user)
        if (user.role === 'none') none.push(user)
      })

      this.staff = ownerStart ? [...owner, ...viewer, ...none] : [...none, ...viewer, ...owner]
    },
    sortChange (val) {
      if (val.prop === 'activityDate' && val.order === 'ascending') {
        this.staff.sort((a, b) => this.sortActivityDate(b, a))
      } else if (val.prop === 'activityDate' && val.order === 'descending') {
        this.staff.sort((a, b) => this.sortActivityDate(a, b))
      }

      if (val.prop === 'role' && val.order === 'ascending') {
        this.roleSort(false)
      } else if (val.prop === 'role' && val.order === 'descending') {
        this.roleSort(true)
      }

      this.updateDataInPage()
    },
    getInstructors () {
      this.loading = true
      // TODO: WE HAVE HARDCODED AMOUNT for now
      const params = { role: 'staff', entity: this.course._id, amount: 2000, skip: 0 }

      this.$http.get('users', { params })
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

          // initial sorting
          this.staff.sort((a, b) => this.sortActivityDate(a, b))
          this.updateDataInPage()
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.loading = false })
    },
    updateDataInPage () {
      this.dataInStep = this.staff.slice(((this.page - 1) * 5) || 0, this.page * 5)
    },
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
    handleCommand (command) { command.instructor.role = command.role },
    dateFormatter (row, column, value) { return value ? moment(value).fromNow() : this.$i18n.t('SW_INVITE_PENDING') }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
