<template>
  <div>
    <affix class="sticky-bar" relative-element-selector="#sticky-content" :offset="{ top: 148, bottom: -1000 }">
      <el-row type="flex" justify="center" align="middle">
        <el-col :xs="11" :sm="16">

          <div v-if="multipleSelection.length">
            <!-- Remove users -->
            <el-badge :value="multipleSelection.length">
              <el-button type="danger" plain size="medium" @click="confirmRemove" class="button-square-xs ">
                <i class="icon-delete"/>
                <span class="hidden-xs hidden-sm">{{ $t('SW_REMOVE') }}</span>
              </el-button>
            </el-badge>

            <!-- Email users -->
            <el-badge :value="multipleSelection.length" v-if="isAdmin">
              <el-button type="primary" size="medium" plain @click="dialogEmail = true" class="button-square-xs ml-5">
                <i class="icon-email"/>
                <span class="hidden-xs">{{ $tc('SW_EMAIL', 1) }}</span>
              </el-button>
            </el-badge>

            <!-- Log in as user -->
            <el-button @click="loginAs" size="medium" v-if="multipleSelection.length === 1 && user.systemAdmin" class="ml-5">
              <i class="icon-enter"/>
              <span class="hidden-xs hidden-sm">{{ $t('SW_LOGIN_AS') }}</span>
            </el-button>

            <!-- Merge user -->
            <el-button @click="dialogMerge = true" size="medium" v-if="user.systemAdmin" class="ml-5">
              <i class="icon-call_merge"/>
              <span class="hidden-xs hidden-sm">{{ $t('SW_MERGE') }}</span>
            </el-button>

            <!-- Clear selection -->
            <el-button type="text" size="medium" @click="selectionChange" class="ml-10">
              <i class="icon-clear"/>
              <span class="hidden-xs hidden-sm">{{ $t('SW_CANCEL') }}</span>
            </el-button>
          </div>

          <div v-else>
            <!-- Add users manually -->
            <el-button v-if="isAdmin" type="primary" plain @click="dialogAddUsers = true" size="medium" class="button-square-xs mr-10">
              <i class="icon-add"/>
              <span class="hidden-xs">{{ $t('SW_ADD_USERS') }}</span>
            </el-button>

            <!-- Merge user -->
            <el-button @click="dialogMerge = true" size="medium" v-if="user.systemAdmin" class="mr-5">
              <i class="icon-call_merge"/>
              <span class="hidden-xs hidden-sm">{{ $t('SW_MERGE') }}</span>
            </el-button>

            <!-- Total users found -->
            <span v-show="status !== 'loading' || tableData.length" class="hidden-xs hidden-sm line-height-38">
              {{ total }} {{ $tc('SW_USERS', total).toLowerCase() }}
            </span>
          </div>
        </el-col>

        <el-col :xs="13" :sm="8">
          <!-- Search input -->
          <el-input v-model="searchText" size="medium" clearable :placeholder="$t('SW_SEARCH_USERS')" class="input-with-select">
            <el-select v-model="roleFilter" slot="prepend" @change="changeFilter">
              <el-option v-for="item in roles" :key="item.value" :label="getOptionText(item.label)" :value="item.value"/>
            </el-select>
          </el-input>
        </el-col>
      </el-row>
    </affix>

    <div class="bar-placeholder"/>

    <!-- Users table -->
    <el-table v-show="tableData.length" :data="tableData" row-key="_id" ref="usersTable" @sort-change="sortChange" class="mt-20"
              @selection-change="selectionChange" :default-sort="{prop: this.sort, order: this.order}" id="sticky-content">

      <!-- Expand -->
      <el-table-column v-if="!hideCourses" type="expand" width="30">
        <template slot-scope="props">
          <expand-user :_id="props.row._id" :user="props.row" :dateFormatter="dateFormatter" :sortCreatedDate="sortCreatedDate"/>
        </template>
      </el-table-column>

      <!-- Selection -->
      <el-table-column type="selection" reserve-selection width="35"/>

      <!-- Name -->
      <el-table-column :label="$t('SW_NAME')" prop="name" min-width="160" sortable :sort-method="sortCaseInsensitive">
        <template slot-scope="props">
          <a href="#" class="text-ellipsis" @click.prevent="editUser(props.row)">
            <thumbnail :model="props.row" class="thumb-user thumb-24 mr-5 hidden-xs hidden-sm"/>
            <strong>{{props.row.name}}</strong>
          </a>
        </template>
      </el-table-column>

      <!-- View profile -->
      <el-table-column :label="$t('SW_PROFILE')" v-if="hasUserProfiles" min-width="70">
        <template slot-scope="props">
          <a href="#" @click.prevent="$router.push({ name: 'profile', params: { id: props.row._id, slug: school.slug } })">
            {{ $t('SW_VIEW') }}
          </a>
        </template>
      </el-table-column>

      <!-- Email address -->
      <el-table-column property="email" :label="$tc('SW_EMAIL', 1)" min-width="180">
        <template slot-scope="props">
          <a :href="'mailto:' + props.row.email" target="_blank" class="text-ellipsis">{{ props.row.email }}</a>
        </template>
      </el-table-column>

      <!-- Organization role of user -->
      <el-table-column property="role" :label="$tc('SW_ROLE', 1)" min-width="80">
        <template slot-scope="props">
            <div class="text-ellipsis">
              <span class="capitalize">{{ getLabelText(props.row.role) }}</span>
            </div>
        </template>
      </el-table-column>

      <!-- Course count -->
      <el-table-column v-if="!hideCourses" property="counts.courses" :label="$tc('SW_COURSE', 2)" width="80">
        <template slot-scope="props">
          <i class="icon-school"/>
          {{ props.row.counts && props.row.counts.courses || 0 }}
        </template>
      </el-table-column>

      <!-- Custom counts -->
      <el-table-column class-name="update-cell-style" v-for="customCount in customCounts" :key="customCount.type" :property="'counts.' + customCount.type" :label="$tc('SW_' + customCount.type.toUpperCase(), 2)" width="120" sortable>
        <template slot-scope="props">
          <i :class="customCount.icon"/>
          {{ props.row.counts && props.row.counts[customCount.type] || 0 | numeral('0a') }}
        </template>
      </el-table-column>

      <!-- Credits -->
      <el-table-column property="credits" v-if="school.creditsEnabled" :label="$t('SW_CREDITS')" width="120">
        <template slot-scope="props">
          <!-- Credits column -->
          <credits-column :scope="props.row" :updateUser="updateUser"/>
        </template>
      </el-table-column>

      <!-- Created date -->
      <el-table-column property="createdDate" :formatter="dateFormatter" :sort-method="sortCreatedDate" :label="$t('SW_CREATED_DATE')" min-width="120" sortable/>

      <!-- Activity date -->
      <el-table-column property="activityDate" :formatter="dateFormatter" :sort-method="sortActivityDate" :label="$t('SW_ACTIVITY_DATE')" min-width="120" sortable/>
    </el-table>

    <mugen-scroll :handler="getUsers" :handle-on-mount="false" :should-handle="status === 'incomplete'"/>
    <table-status :status="status" :noneText="$t('SW_NO_USERS_FOUND')" @clearSearch="searchText = ''"/>

    <!-- Add users dialog -->
    <el-dialog :title="$t('SW_ADD_USERS')" append-to-body class="small-dialog" :visible.sync="dialogAddUsers">
      <users-create v-if="dialogAddUsers" :closeDialog="closeDialog"/>
    </el-dialog>

    <!-- Edit user dialog -->
    <el-dialog :title="$t('SW_EDIT_USER')" append-to-body :visible.sync="dialogEditUser">
      <user-account-form :form="editUserForm" :updateUser="updateUser" v-if="dialogEditUser" class="edit-user-form" :finish="finishEditUser"/>
    </el-dialog>

    <!-- Email dialog -->
    <el-dialog :title="$tc('SW_SEND_EMAIL_TO_SELECTION_USERS', multipleSelection.length)" append-to-body :visible.sync="dialogEmail">
      <email-users v-if="dialogEmail" :selectedUsers="multipleSelection" :closeDialog="closeDialog"/>
    </el-dialog>

    <!-- Merge dialog -->
    <el-dialog :title="$t('SW_MERGE_USERS')" append-to-body :visible.sync="dialogMerge">
      <users-merge v-if="dialogMerge" :selectedUsers="multipleSelection" :closeDialog="closeDialog"/>
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import moment from 'moment'
import config from 'config'
import debounce from 'lodash/debounce'
import dateSorter from '../../utils/date-sorter'
import ExpandUser from '../../components/ExpandUser'
import UsersMerge from '../../components/UsersMerge'
import EmailUsers from '../../components/EmailUsers'
import UsersCreate from '../../components/UsersCreate'
import UserAccountForm from '../../components/UserAccountForm'
import CreditsColumn from '../../components/CreditsColumn'
import sortCaseInsensitive from '../../utils/sort-case-insensitive'

export default {
  name: 'UsersTable',
  components: { UserAccountForm, UsersCreate, EmailUsers, ExpandUser, UsersMerge, CreditsColumn },

  data () {
    return {
      status: false,
      searchText: this.$route.query.query || '',
      sort: 'activityDate',
      order: 'ascending',
      roles: config.usersTableRoles,
      roleFilter: false,
      tableData: [],
      customCounts: config.userCounts,
      inLTI: this.$store.state.inLTI,
      skip: false,
      total: 0,
      multipleSelection: [],
      user: this.$store.state.user,
      lang: this.$store.state.lang,
      isAdmin: this.$store.state.isAdmin,
      school: this.$store.state.school,
      editUserForm: false,
      hideCourses: config.hideCourses,
      hasUserProfiles: config.hasUserProfiles,
      dialogAddUsers: false,
      dialogEditUser: false,
      creditsDialog: false,
      dialogEmail: false,
      dialogMerge: false
    }
  },

  watch: {
    searchText: debounce(function () {
      this.$router.replace({ name: 'admin', params: { slug: this.school.slug, mode: 'users' }, query: { query: this.searchText, filter: this.roleFilter } })
    }, 400),
    $route: {
      immediate: true,
      handler () {
        this.roleFilter = this.$route.query.filter || this.roles[0].value
        this.selectionChange()
        this.getUsers(true)
      }
    }
  },

  mounted () {
    this.getUsers()
  },

  methods: {
    getLabelText (role) {
      if (role === 'student') return this.school.terminology.student[this.lang]
      else if (role === 'staff') return this.school.terminology.instructor[this.lang]
      else if (role === 'assessor') return this.$i18n.tc('SW_ASSESSOR', 1)
      else if (role === 'admin') return this.$i18n.tc('SW_ADMIN', 1)
    },
    getOptionText (role) {
      if (role === 'all') return this.$i18n.t('SW_ALL')
      if (role === 'students') return this.school.terminology.students[this.lang]
      else if (role === 'staffs') return this.school.terminology.instructors[this.lang]
      else if (role === 'assessors') return this.$i18n.tc('SW_ASSESSOR', 2)
      else if (role === 'admins') return this.$i18n.tc('SW_ADMIN', 2)
    },
    getUsers (refresh) {
      if (this.status === 'loading') return
      this.status = 'loading'

      // TODO: Change sort to: (name|createdDate) etc

      const params = {
        entity: this.user.organization._id,
        amount: 30,
        role: this.roleFilter,
        sort: this.sort,
        order: this.order === 'ascending' ? (this.sort === 'name' ? '1' : '-1') : (this.sort === 'name' ? '-1' : '1')
      }

      if (refresh) {
        this.tableData = []
        this.skip = false
        this.total = 0
      }

      if (this.roleFilter === 'all') delete params.role
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
      this.$confirm(this.$i18n.tc('SW_DELETE_USERS_CONFIRM', this.multipleSelection.length), this.$i18n.tc('SW_DELETE_USERS', this.multipleSelection.length), {
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
    editUser (user) {
      this.editUserForm = Vue.util.extend({}, user)
      this.editUserForm.organization = this.user.organization
      this.dialogEditUser = true
    },
    closeDialog (refresh) {
      this.dialogAddUsers = false
      this.dialogEmail = false
      this.dialogMerge = false
      this.selectionChange()
      if (refresh) {
        this.searchText = ''
        this.getUsers(true)
      }
    },
    updateUser (userId, user) {
      this.tableData = this.tableData.filter(u => u._id !== userId)
      this.tableData.push(user)
    },
    finishEditUser () {
      this.editUserForm = false
      this.dialogEditUser = false
    },
    changeFilter (filter) { this.$router.push({ name: 'admin', params: { slug: this.school.slug, mode: 'users' }, query: { query: this.searchText, filter: filter } }) },
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
