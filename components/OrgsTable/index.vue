<template>
  <div>
    <affix class="sticky-bar" relative-element-selector="#sticky-content" :offset="{ top: 148, bottom: -1000 }">
      <el-row type="flex" justify="center" align="middle">
        <el-col :xs="11" :sm="16">
          <div v-if="multipleSelection.length">
            <!-- Remove orgs -->
            <el-badge :value="multipleSelection.length">
              <el-button type="danger" plain size="medium" class="button-square-xs" @click="confirmRemove" :loading="submitting">
                <i class="icon-delete"></i>
                <span class="hidden-xs hidden-sm">{{ $t('SW_REMOVE') }}</span>
              </el-button>
            </el-badge>

            <!-- Email -->
            <el-badge :value="multipleSelection.length">
              <el-button size="medium" type="primary" plain class="button-square-xs ml-5" @click="dialogNewsletter = true">
                <i class="icon-email"></i>
                <span class="hidden-xs hidden-sm">{{ $t('SW_NEWSLETTER') }}</span>
              </el-button>
            </el-badge>

            <!-- Clear selection -->
            <el-button type="text" size="medium" class="ml-10" @click="selectionChange">
              <i class="icon-clear"></i>
              <span class="hidden-xs hidden-sm">{{ $t('SW_CANCEL') }}</span>
            </el-button>
          </div>

          <div v-else>
            <!-- Create org -->
            <el-button type="primary" plain size="medium" @click="dialogOrg = true" class="button-square-xs">
              <i class="icon-add"></i>
              <span class="hidden-xs">{{ $t('SW_CREATE_ORG') }}</span>
            </el-button>

            <!-- Total orgs found -->
            <span v-show="status !== 'loading' || tableData.length" class="hidden-xs hidden-sm ml-10 line-height-38">
              {{ total }} {{ $t('SW_ORGANIZATIONS').toLowerCase() }}
            </span>
          </div>
        </el-col>

        <el-col :xs="13" :sm="8">
          <!-- Search input -->
          <el-input class="block" size="medium" v-model="searchText" clearable prefix-icon="icon-search" :placeholder="$t('SW_SEARCH_ORGS')"></el-input>
        </el-col>
      </el-row>
    </affix>
    <div class="bar-placeholder"></div>

    <!-- Org table -->
    <el-table v-show="tableData.length" row-key="_id" ref="orgsTable" @sort-change="sortChange" :data="tableData" class="mt-20"
              @selection-change="selectionChange" :default-sort="{prop: this.sort, order: this.order}" id="sticky-content">
      <!-- Expand -->
      <el-table-column type="expand" width="30">
        <template slot-scope="props">
          <el-row type="flex">
            <el-col :span="12">
              <p><strong class="mr-5">{{ $t('SW_NAME') }}</strong>{{ props.row.name[lang] }}</p>
              <p><strong class="mr-5">ID</strong> {{ props.row._id }}</p>
            </el-col>
            <el-col :span="12">
              <p><strong class="mr-5">Slug</strong> {{ props.row.slug }}</p>
            </el-col>
          </el-row>
          <el-form :model="props.row" label-width="220px" :disabled="true">
            <org-options :form="props.row"></org-options>
          </el-form>
        </template>
      </el-table-column>
      <!-- Selection checkboxes -->
      <el-table-column type="selection" reserve-selection width="35"></el-table-column>
      <!-- Name -->
      <el-table-column property="name" :label="$t('SW_ORGANIZATION')" min-width="160" sortable :sort-method="sortName">
        <template slot-scope="props">
          <strong class="block text-ellipsis">{{ props.row.name[lang] }}</strong>
        </template>
      </el-table-column>
      <!-- LMS -->
      <el-table-column property="lastConfiguredLms" label="LMS" min-width="140">
        <template slot-scope="props">
          <span v-if="props.row.lastConfiguredLms && props.row.lmsApiIntegration" class="block text-ellipsis capitalize">{{ props.row.lastConfiguredLms }}</span>
          <span v-else class="text-muted">{{ $t('SW_NONE') }}</span>
        </template>
      </el-table-column>
      <!-- User count -->
      <el-table-column property="counts.users" :label="$t('SW_USERS')" width="120" sortable>
        <template slot-scope="props">
          <i class="icon-user"></i>
          {{ props.row.counts && props.row.counts.users || 0 | numeral('0a') }}
        </template>
      </el-table-column>
      <!-- Custom counts -->
      <el-table-column v-for="customCount in customCounts" :key="customCount.type" :property="'counts.' + customCount.type" :label="$t('SW_' + customCount.type.toUpperCase())" width="120" sortable>
        <template slot-scope="props">
          <i :class="customCount.icon"></i>
          {{ props.row.counts && props.row.counts[customCount.type] || 0 | numeral('0a') }}
        </template>
      </el-table-column>
      <!-- Your role -->
      <el-table-column property="role" :label="$t('SW_YOUR_ROLE')" min-width="110">
        <template slot-scope="props">
          <span v-if="props.row.role">{{ $t('SW_' + props.row.role.toUpperCase() )}}</span>
          <div v-else>
            <el-button type="text" size="mini" @click="becomeAdmin(props.row)" :disabled="sending">
              {{ $t('SW_BECOME_ADMIN') }}
            </el-button>
          </div>
        </template>
      </el-table-column>
      <!-- Created date -->
      <el-table-column property="createdDate" :formatter="dateFormatter" :sort-method="sortCreatedDate" :label="$t('SW_CREATED_DATE')" min-width="160" sortable></el-table-column>
    </el-table>

    <!-- Infinite scroll -->
    <mugen-scroll :handler="getOrgs" :handle-on-mount="false" :should-handle="status === 'incomplete'"></mugen-scroll>

    <!-- Table status -->
    <table-status :status="status" :noneText="$t('SW_NO_ORGS_FOUND')" @clearSearch="searchText = ''"></table-status>

    <!-- Create org dialog -->
    <el-dialog :title="$t('SW_CREATE_ORG')" append-to-body :visible.sync="dialogOrg">
      <create-org :closeDialog="closeDialog" v-if="dialogOrg"></create-org>
    </el-dialog>

    <!-- Newsletter dialog -->
    <el-dialog :title="$t('SW_SEND_NEWSLETTER')" append-to-body :visible.sync="dialogNewsletter" :close-on-click-modal="false" :close-on-press-escape="false">
      <newsletter :selectedOrgs="multipleSelection" :closeDialog="closeDialog"></newsletter>
    </el-dialog>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import moment from 'moment'
import CreateOrg from '@/edpack-web/components/CreateOrg'
import Newsletter from '@/edpack-web/components/Newsletter'
import TableStatus from '@/edpack-web/components/TableStatus'
import OrgOptions from '@/components/OrgOptions'
import dateSorter from '@/edpack-web/utils/date-sorter'
import sortCaseInsensitive from '@/edpack-web/utils/sort-case-insensitive'

export default {
  name: 'OrgsTable',
  props: ['customCounts'],
  components: { CreateOrg, OrgOptions, Newsletter, TableStatus },

  data () {
    return {
      status: false,
      sort: 'createdDate',
      order: 'ascending',
      searchText: this.$route.query.query || '',
      tableData: [],
      multipleSelection: [],
      skip: false,
      total: 0,
      school: this.$store.state.school,
      dialogOrg: false,
      dialogNewsletter: false,
      processing: false,
      sending: false,
      user: this.$store.state.user,
      lang: this.$store.state.lang,
      submitting: false
    }
  },

  watch: {
    searchText: debounce(function () {
      this.$router.replace({ query: { query: this.searchText } })
    }, 400),
    '$route' () {
      this.selectionChange()
      this.getOrgs(true)
    }
  },

  mounted () {
    this.getOrgs()
  },

  methods: {
    getOrgs (refresh) {
      if (this.status === 'loading') return
      this.status = 'loading'

      const params = {
        amount: 20,
        sort: this.sort,
        order: this.order === 'ascending' ? (this.sort === 'name' ? '1' : '-1') : (this.sort === 'name' ? '-1' : '1')
      }

      if (refresh) {
        this.tableData = []
        this.skip = false
      }

      if (this.skip) params.skip = this.skip
      if (this.searchText) params.filter = this.searchText

      this.$http.get('organizations', { params })
        .then((res) => {
          this.tableData = this.tableData.concat(res.data.list)
          this.status = res.data.total ? (res.data.done ? 'done' : 'incomplete') : (this.searchText ? 'noResults' : 'none')
          this.skip = res.data.skip
          this.total = res.data.total
        })
        .catch(() => { this.status = 'error' })
    },
    becomeAdmin (org) {
      if (this.sending || !org) return
      this.sending = true

      const invitations = [{
        recipientEmail: this.user.email,
        contextId: org._id,
        role: 'admin'
      }]

      this.$http.post('users/invite', { invitations }, { params: { toSelf: false } })
        .then(() => {
          this.$message({ message: this.$i18n.t('SW_YOU_ARE_ADMIN_NOW'), type: 'success' })
          org.role = 'admin'
          this.user.organizations.push(org)
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.sending = false })
    },
    confirmRemove () {
      this.$confirm(this.$i18n.tc('SW_DELETE_ORG_CONFIRM', this.multipleSelection.length), this.$i18n.tc('SW_DELETE_ORG', this.multipleSelection.length), {
        confirmButtonText: this.$i18n.t('SW_DELETE'),
        cancelButtonText: this.$i18n.t('SW_CANCEL')
      }).then(() => { this.removeOrg() })
    },
    removeOrg () {
      this.submitting = true
      const organizations = this.multipleSelection.map(org => org._id)

      this.$http.delete('organizations', { params: { organizations } })
        .then(() => {
          this.$message({ message: this.$i18n.t('SW_ORGS_REMOVED'), type: 'success' })
          this.removeFromTable(organizations)
          this.selectionChange()
          this.skip = this.skip - organizations.length
          this.total = this.total - organizations.length
        })
        .catch(() => { this.$message({ message: this.$i18n.t('SW_REMOVE_UNSUCCESSFUL'), type: 'error' }) })
        .finally(() => { this.submitting = false })
    },
    closeDialog (refresh) {
      this.dialogOrg = false
      this.dialogNewsletter = false

      if (refresh) {
        this.searchText = ''
        this.selectionChange()
        this.getOrgs(true)
      }
    },
    selectionChange (val) {
      if (Array.isArray(val)) {
        if (((val.length - this.multipleSelection.length) || 0) > 1) {
          if (val.length === this.total) this.$message({ message: this.$i18n.t('SW_ALL_SELECTED_ORGS'), type: 'success' })
          else this.$message({ message: this.$i18n.t('SW_SELECTED_MULTIPLE_ORGS', [val.length, this.total]), type: 'success' })
        }
        this.multipleSelection = val
        return
      }

      this.multipleSelection = []
      if (this.$refs.orgsTable) this.$refs.orgsTable.clearSelection()
    },
    removeFromTable (organizations) {
      this.tableData = this.tableData.filter(org => !organizations.find(_id => org._id === _id))
      if (this.tableData.length === 0) this.status = 'none'
      this.$emit('refreshTable')
    },
    sortChange (val) {
      if (val.prop === this.sort && val.order === this.order) return
      this.sort = val.prop
      this.order = val.order
      if (this.status !== 'done') this.getOrgs(true)
    },
    dateFormatter (row, column, value) { return moment(value).fromNow() },
    sortCreatedDate (a, b) { return dateSorter(a.createdDate, b.createdDate) },
    sortName (a, b) { return sortCaseInsensitive(a.name[this.lang], b.name[this.lang]) }
  }
}
</script>
