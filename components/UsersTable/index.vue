<template>
  <div>
    <affix class="sticky-bar" relative-element-selector="#sticky-content" :offset="{ top: 148, bottom: -1000 }">
      <el-row type="flex" justify="center" align="middle">
        <el-col :xs="11" :sm="16">

          <div v-if="multipleSelection.length">
            <!-- Remove users -->
            <el-badge :value="multipleSelection.length">
              <el-button type="danger" plain size="medium" @click="confirmRemove" class="button-square-xs ">
                <i class="icon-delete"></i>
                <span class="hidden-xs hidden-sm">{{ $t('SW_REMOVE') }}</span>
              </el-button>
            </el-badge>

            <!-- Email users -->
            <el-badge :value="multipleSelection.length" v-if="isAdmin">
              <el-button type="primary" size="medium" plain @click="dialogEmail = true" class="button-square-xs ml-5">
                <i class="icon-email"></i>
                <span class="hidden-xs">{{ $t('SW_EMAIL') }}</span>
              </el-button>
            </el-badge>

            <!-- Log in as user -->
            <el-button @click="loginAs" size="medium" v-if="multipleSelection.length === 1 && user.systemAdmin" class="hidden-xs hidden-sm ml-5">
              <span>{{ $t('SW_LOGIN_AS') }}</span>
            </el-button>

            <!-- Clear selection -->
            <el-button type="text" size="medium" @click="selectionChange" class="ml-10">
              <i class="icon-clear"></i>
              <span class="hidden-xs hidden-sm">{{ $t('SW_CANCEL') }}</span>
            </el-button>
          </div>

          <div v-else>
            <!-- Add users manually -->
            <el-button type="primary" plain @click="dialogAddUsers = true" size="medium" class="button-square-xs mr-10">
              <i class="icon-add"></i>
              <span class="hidden-xs">{{ $t('SW_ADD_USERS') }}</span>
            </el-button>

            <!-- Total users found -->
            <span v-show="status !== 'loading' || tableData.length" class="hidden-xs hidden-sm line-height-38">
              {{ total }} {{ $t('SW_USERS').toLowerCase() }}
            </span>
          </div>
        </el-col>

        <el-col :xs="13" :sm="8">
          <!-- Search input -->
          <el-input v-model="searchText" size="medium" clearable :placeholder="$t('SW_SEARCH_USERS')" class="input-with-select">
            <el-select v-model="roleFilter" slot="prepend" @change="changeFilter">
              <el-option v-for="item in roles" :key="item.value" :label="$t('SW_' + item.label.toUpperCase())" :value="item.value"></el-option>
            </el-select>
          </el-input>
        </el-col>
      </el-row>
    </affix>
    <div class="bar-placeholder"></div>

    <!-- Users table -->
    <el-table v-show="tableData.length" :data="tableData" row-key="_id" ref="usersTable" @sort-change="sortChange" class="mt-20"
              @selection-change="selectionChange" :default-sort="{prop: this.sort, order: this.order}" id="sticky-content">
      <!-- Expand -->
      <el-table-column type="expand" width="30">
        <template slot-scope="props">
          <div class="mb-10"><strong class="mr-5">ID</strong> {{ props.row._id }}</div>

          <div v-if="props.row.courses && props.row.courses.length">
            <el-table :data="props.row.courses" row-key="_id" :default-sort="{prop: 'createdDate', order: 'descending'}">
              <el-table-column property="name" :label="$t('SW_COURSE')" min-width="180">
                <template slot-scope="scope">
                  <router-link  :to="{ name: 'staff', params: { course: scope.row._id, slug: school.slug } }" class="block text-ellipsis">
                    <span v-if="scope.row.name">{{ scope.row.name }}</span>
                    <span v-else>-</span>
                    <lms-icon :model="scope.row"></lms-icon>
                  </router-link>
                </template>
              </el-table-column>
              <el-table-column property="role" :label="$t('SW_ROLE')" min-width="110">
                <template slot-scope="scope">
                  <span v-if="scope.row.role">{{ $t('SW_' + scope.row.role.toUpperCase() )}}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column property="createdDate" :formatter="dateFormatter" :sort-method="sortCreatedDate" :label="$t('SW_CREATED_DATE')" min-width="140"></el-table-column>
            </el-table>
          </div>
          <div v-else>{{ $t('SW_NO_COURSES_FOUND') }}</div>
        </template>
      </el-table-column>
      <!-- Selection -->
      <el-table-column type="selection" reserve-selection width="35"></el-table-column>
      <!-- Name -->
      <el-table-column :label="$t('SW_NAME')" prop="name" min-width="160" sortable :sort-method="sortCaseInsensitive">
        <template slot-scope="props">
          <a href class="text-ellipsis" @click="editUser(props.row, $event)">
            <thumbnail :model="props.row" class="thumb-user thumb-24 mr-5 hidden-xs hidden-sm"></thumbnail>
            <strong>{{props.row.name}}</strong>
          </a>
        </template>
      </el-table-column>
      <!-- Email address -->
      <el-table-column property="email" :label="$t('SW_EMAIL')" min-width="180">
        <template slot-scope="props">
          <a :href="'mailto:' + props.row.email" target="_blank" class="text-ellipsis">{{ props.row.email }}</a>
        </template>
      </el-table-column>

      <!-- Organization role of user -->
      <el-table-column property="role" :label="$t('SW_ROLE')" min-width="80">
        <template slot-scope="props">
            <div class="text-ellipsis">
              {{ $t('SW_' + props.row.role.toUpperCase() )}}
            </div>
        </template>
      </el-table-column>
      <!-- Course count -->
      <el-table-column property="counts.courses" :label="$t('SW_COURSES')" width="120">
        <template slot-scope="props">
          <i class="icon-graduation"></i>
          {{ props.row.counts && props.row.counts.courses || 0 }}
        </template>
      </el-table-column>
      <!-- Created date -->
      <el-table-column property="createdDate" :formatter="dateFormatter" :sort-method="sortCreatedDate" :label="$t('SW_CREATED_DATE')" min-width="140" sortable></el-table-column>
      <!-- Activity date -->
      <el-table-column property="activityDate" :formatter="dateFormatter" :sort-method="sortActivityDate" :label="$t('SW_ACTIVITY_DATE')" min-width="140" sortable></el-table-column>
    </el-table>

    <!-- Infinite scroll -->
    <mugen-scroll :handler="getUsers" :handle-on-mount="false" :should-handle="status === 'incomplete'"></mugen-scroll>

    <!-- Table status -->
    <table-status :status="status" :noneText="$t('SW_NO_USERS_FOUND')" @clearSearch="searchText = ''"></table-status>

    <!-- Add users dialog -->
    <el-dialog :title="$t('SW_ADD_USERS')" append-to-body class="small-dialog" :visible.sync="dialogAddUsers">
      <users-create v-if="dialogAddUsers" :closeDialog="closeDialog"></users-create>
    </el-dialog>

    <!-- Edit user dialog -->
    <el-dialog :title="$t('SW_EDIT_USER')" append-to-body :visible.sync="dialogEditUser">
      <user-account-form :form="editUserForm" v-if="dialogEditUser" :finish="finishEditUser"></user-account-form>
    </el-dialog>

    <!-- Email dialog -->
    <el-dialog :title="$t('SW_SEND_EMAIL_TO_SELECTION_USERS')" append-to-body :visible.sync="dialogEmail">
      <email-users v-if="dialogEmail" :selectedUsers="multipleSelection" :closeDialog="closeDialog"></email-users>
    </el-dialog>
  </div>
</template>

<script>
import moment from 'moment'
import Vue from 'vue'
import debounce from 'lodash/debounce'
import dateSorter from '../../utils/date-sorter'
import sortCaseInsensitive from '../../utils/sort-case-insensitive'
import UserAccountForm from '../../components/UserAccountForm'
import EmailUsers from '../../components/EmailUsers'
import LmsIcon from '../../components/LmsIcon'
import TableStatus from '../../components/TableStatus'
import UsersCreate from '../../components/UsersCreate'

export default {
  name: 'UsersTable',
  components: { UserAccountForm, UsersCreate, EmailUsers, LmsIcon, TableStatus },

  data () {
    return {
      status: false,
      searchText: this.$route.query.query || '',
      sort: 'name',
      order: 'ascending',
      roles: [
        { label: 'all', value: 'all' },
        { label: 'admins', value: 'admin' },
        { label: 'staffs', value: 'staff' },
        { label: 'students', value: 'student' }],
      roleFilter: this.$route.query.filter || 'all',
      tableData: [],
      inLTI: this.$store.state.inLTI,
      skip: false,
      total: 0,
      multipleSelection: [],
      user: this.$store.state.user,
      isAdmin: this.$store.state.isAdmin,
      school: this.$store.state.school,
      editUserForm: false,
      dialogAddUsers: false,
      dialogEditUser: false,
      dialogEmail: false
    }
  },

  watch: {
    searchText: debounce(function () {
      this.$router.replace({ query: { query: this.searchText, filter: this.roleFilter } })
    }, 400),
    '$route' () {
      this.selectionChange()
      this.getUsers(true)
    }
  },

  mounted () {
    this.getUsers()
  },

  methods: {
    getUsers (refresh) {
      if (this.status === 'loading') return
      this.status = 'loading'

      // CHange sort to: (name|createdDate) etc

      const params = {
        entity: this.user.organization._id,
        amount: 30,
        sort: this.sort,
        order: this.order === 'ascending' ? (this.sort === 'name' ? '1' : '-1') : (this.sort === 'name' ? '-1' : '1')
      }

      if (refresh) {
        this.tableData = []
        this.skip = 0
      }

      if (this.roleFilter !== 'all') params.role = this.roleFilter
      if (this.skip) params.skip = this.skip
      if (this.searchText) params.filter = this.searchText

      this.$http.get('users', { params })
        .then((res) => {
          this.tableData = this.tableData.concat(res.data.list)
          this.status = res.data.total ? (res.data.done ? 'done' : 'incomplete') : (this.searchText ? 'noResults' : 'none')
          this.skip = res.data.skip
          this.total = res.data.total
        })
        .catch(() => { this.status = 'error' })
    },
    loginAs () {
      const userId = this.multipleSelection[0]._id
      this.$http.post(`users/${userId}/adopt`)
        .then(() => { window.location = window.location.origin })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
    },
    selectionChange (val) {
      if (Array.isArray(val)) {
        if (((val.length - this.multipleSelection.length) || 0) > 1) {
          if (val.length === this.total) this.$message({ message: this.$i18n.t('SW_ALL_SELECTED_USERS'), type: 'success' })
          else this.$message({ message: this.$i18n.t('SW_SELECTED_MULTIPLE_USERS', [val.length, this.total]), type: 'success' })
        }
        this.multipleSelection = val
        return
      }

      this.multipleSelection = []
      if (this.$refs.usersTable) this.$refs.usersTable.clearSelection()
    },
    sortChange (val) {
      if (val.prop === this.sort && val.order === this.order) return
      this.sort = val.prop
      this.order = val.order
      if (this.status !== 'done') this.getUsers(true)
    },
    confirmRemove () {
      this.$confirm(this.$i18n.t('SW_DELETE_USERS_CONFIRM'), this.$i18n.t('SW_DELETE_USERS'), {
        confirmButtonText: this.$i18n.t('SW_DELETE'),
        cancelButtonText: this.$i18n.t('SW_CANCEL')
      }).then(() => { this.removeUsers() })
    },
    removeUsers () {
      this.submitting = true
      const users = this.multipleSelection.map(user => user._id)

      this.$http.delete('users', { params: { users } })
        .then(() => {
          this.$message({ message: this.$i18n.t('SW_USERS_REMOVED'), type: 'success' })
          this.removeFromTable(users)
          this.selectionChange()
          this.skip = this.skip - users.length
          this.total = this.total - users.length
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.submitting = false })
    },
    removeFromTable (users) {
      this.tableData = this.tableData.filter(user => !users.find(_id => user._id === _id))
      if (this.tableData.length === 0) this.status = 'none'
      this.$emit('refreshTable')
    },
    editUser (user, e) {
      e.preventDefault()
      this.editUserForm = Vue.util.extend({}, user)
      this.editUserForm.organization = this.user.organization
      this.dialogEditUser = true
    },
    closeDialog (refresh) {
      this.dialogAddUsers = false
      this.dialogEmail = false
      this.selectionChange()
      if (refresh) {
        this.searchText = ''
        this.getUsers(true)
      }
    },
    finishEditUser (updatedUser) {
      this.editUserForm = false
      this.dialogEditUser = false
      if (!updatedUser) return

      const index = this.tableData.findIndex(user => user._id === updatedUser._id)
      this.tableData.splice(index, 1, updatedUser)
    },
    changeFilter (filter) { this.$router.replace({ query: { query: this.searchText, filter: filter } }) },
    dateFormatter (row, column, value) { return value ? moment(value).fromNow() : '-' },
    sortCreatedDate (a, b) { return dateSorter(a.createdDate, b.createdDate) },
    sortActivityDate (a, b) { return dateSorter(a.activityDate, b.activityDate) },
    sortCaseInsensitive (a, b) { return sortCaseInsensitive(a.name, b.name) }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import 'style';
</style>
