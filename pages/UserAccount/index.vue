<template>
  <div>
    <page-cover>
      <page-header :title="$t('SW_MY_ACCOUNT')" :intro="$t('SW_MY_ACCOUNT_SHORT')"></page-header>

      <!-- View your profile -->
      <el-button size="small" type="primary" v-if="hasUserProfiles" @click="$router.push({ name: 'profile', params: { id: form._id, slug: school.slug } })" class="mt-10">
        <i class="icon-bio"></i>
        {{ $t('SW_VIEW_PROFILE') }}
      </el-button>

      <!-- Log out -->
      <el-button size="small" @click="logout" class="mt-10">
        <i class="icon-exit"></i>
        {{ $t('SW_LOG_OUT') }}
      </el-button>

      <!-- User account options -->
      <el-dropdown trigger="click" class="hide" @command="handleCommand">
        <el-button class="ml-10" size="small">
          <span>{{ $t('SW_MORE') }}</span>
          <i class="el-icon-caret-bottom el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <!-- Clear sessions -->
          <el-dropdown-item :command="{type: 'clearSessions'}">
            <i class="icon-cancel"></i>
            <span>{{ $t('SW_CLEAR_SESSIONS') }}</span>
          </el-dropdown-item>
          <!-- Delete account -->
          <el-dropdown-item :command="{type: 'delete'}">
            <i class="icon-delete"></i>
            <span>{{ $t('SW_DELETE_ACCOUNT') }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </page-cover>

    <!-- Account form -->
    <div class="page-body">
      <user-account-form :form="form" :finish="finish"></user-account-form>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import config from 'config'
import UserAccountForm from '../../components/UserAccountForm'
import { removeCsrfToken } from '../../utils/csrf-handling'

export default {
  name: 'UserAccount',
  metaInfo: { title: 'Account' },
  components: { UserAccountForm },

  data () {
    return {
      submitting: false,
      hasUserProfiles: config.hasUserProfiles,
      school: this.$store.state.school,
      form: Vue.util.extend({}, this.$store.state.user),
      inLTI: this.$store.state.inLTI
    }
  },

  methods: {
    logout () {
      this.$http.post('users/logout', {})
        .then(() => {
          if (window.fcWidget) window.fcWidget.destroy()
          removeCsrfToken()
          window.location.assign('/')
        })
    },
    finish () {
      let route = { name: 'home', params: { slug: this.school.slug } }
      if (this.isAdmin) route = '/admin'
      this.$router.push(route)
    },
    handleCommand (command) {
      if (command.type === 'delete') this.confirmDelete()
      else this.confirmClear()
    },
    confirmDelete () {
      this.$confirm(this.$i18n.t('SW_DELETE_ACCOUNT_CONFIRM'), this.$i18n.t('SW_DELETE_ACCOUNT'), {
        confirmButtonText: this.$i18n.t('SW_DELETE'),
        cancelButtonText: this.$i18n.t('SW_CANCEL')
      }).then(() => { this.deleteAccount() })
    },
    confirmClear () {
      this.$confirm(this.$i18n.t('SW_CLEAR_SESSIONS_CONFIRM'), this.$i18n.t('SW_CLEAR_SESSIONS'), {
        confirmButtonText: this.$i18n.t('SW_CLEAR'),
        cancelButtonText: this.$i18n.t('SW_CANCEL')
      }).then(() => { this.clearSessions() })
    },
    deleteAccount () {
      this.$http.delete(`users/${this.form._id}`)
        .then(() => { this.logout() })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.submitting = false })
    },
    clearSessions () {
      this.$http.delete(`users/${this.form._id}`)
        .then(() => { this.logout() })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.submitting = false })
    }
  }
}
</script>
