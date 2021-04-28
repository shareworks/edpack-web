<template>
  <div>
    <page-cover v-if="status === 'done'">
      <!-- App thumb -->
      <div class="page-thumb pull-left">
        <thumbnail :model="user" :large="true" class="thumb-user user-profile-thumb thumb-80"/>
      </div>

      <div class="header-info">
        <!-- App title -->
        <h1 class="profile-title">
          {{user.name}}
        </h1>

        <!-- Faculty -->
        <div class="profile-text mb-20">
          <span>{{ getFaculty }}</span>
          &centerdot;
          <a :href="'mailto:' + user.email">{{user.email }}</a>
          <span v-if="user.lastActivityDate">&centerdot;</span>
          <span v-if="user.lastActivityDate">{{ fromNow(user.lastActivityDate) }}</span>
        </div>

        <!-- Email user -->
        <el-button v-if="!isSelf" @click="dialogEmail = true" type="primary" size="medium">
          <i class="icon-email"></i>
          {{ $tc('SW_EMAIL', 1) }}
        </el-button>

        <!-- Edit profile -->
        <el-button @click="$router.push({name: 'account', params: { slug: school.slug }})" v-if="isSelf" type="primary" size="medium">
          <i class="icon-pencil"></i>
          <span class="visible-xs-inline visible-sm-inline">{{ $t('SW_EDIT') }}</span>
          <span class="hidden-xs hidden-sm">{{ $t('SW_EDIT_PROFILE') }}</span>
        </el-button>

        <!-- Log out -->
        <el-button @click="logout" v-if="isSelf" size="medium">
          <i class="icon-exit"></i>
          <span class="hidden-xs">{{ $t('SW_LOG_OUT') }}</span>
        </el-button>

        <!-- Language -->
        <app-language class="ml-10"/>
      </div>
    </page-cover>

    <div class="page-body" v-if="status === 'done'">
      <!-- Plans -->
      <div class="mb-10" v-if="school.enablePlans">
        <h3 class="mb-20">{{ school.terminology.plans[lang] }}</h3>
        <!-- Plans list -->
        <plans-list :user="user"/>
      </div>
      <el-row :gutter="60">
        <el-col :xs="24" :sm="14">
          <h3 class="mb-20">{{ $t('SW_APPS_I_FOLLOW') }}</h3>
          <!-- Apps tiles -->
          <masonry :cols="{default: 3, 1199: 2, 767: 1}" v-if="apps.length" :gutter="{default: '30px', 767: '20px'}">
            <app-tile v-for="page in apps" :app="page" :key="page._id"/>
          </masonry>
          <div v-else class="text-muted">{{ $t('SW_NO_APPS_FOLLOWING') }}</div>
        </el-col>
        <el-col :xs="24" :sm="10">
          <h3 class="mb-20">{{ $t('SW_EXPERIENCES') }}</h3>
          <!-- Experiences -->
          <experiences :user="user" :startLimit="5" class="mb-30"/>
        </el-col>
      </el-row>
    </div>

    <!-- Loading -->
    <spinner v-if="status === 'loading'" class="mt-20"/>

    <!-- Error -->
    <div v-if="status === 'error'" class="text-muted text-center mt-20">
      {{ $t('SW_ERROR_LOADING') }}
    </div>

    <!-- Email dialog -->
    <el-dialog :title="$tc('SW_EMAIL', 1)" append-to-body :visible.sync="dialogEmail">
      <email-users :closeDialog="toggleEmailDialog" :selectedUsers="[user]">
        <template v-slot>
          <p class="mb-30">{{ $t('SW_EMAIL_USER', [user.name]) }}</p>
        </template>
      </email-users>
    </el-dialog>
  </div>
</template>

<script>
import moment from 'moment'
import scrollTop from 'simple-scrolltop'
import AppTile from '@/components/AppTile'
import PlansList from '@/components/PlansList'
import Experiences from '@/components/Experiences'
import EmailUsers from '@/edpack-web/components/EmailUsers'
import { removeCsrfToken } from '@/edpack-web/utils/csrf-handling'

export default {
  name: 'UserProfile',
  components: { AppTile, Experiences, PlansList, EmailUsers },

  data () {
    return {
      status: false,
      dialogEmail: false,
      school: this.$store.state.school,
      lang: this.$store.state.user.language,
      currentUser: this.$store.state.user,
      user: false,
      isSelf: false,
      loadingApps: false,
      apps: []
    }
  },

  created () {
    this.getProfile(this.$route.params.id)
    this.getApps(this.$route.params.id)
  },

  beforeRouteUpdate (to, from, next) {
    this.getProfile(to.params.id)
    this.getApps(to.params.id)
    scrollTop(0)
    next()
  },

  computed: {
    getFaculty () {
      const faculty = this.school.faculties.find(fac => fac._id === this.user.faculty)
      return faculty ? faculty[this.lang] : this.$i18n.t('SW_NO_FACULTY', [this.school.terminology.faculty[this.lang].toLowerCase()])
    }
  },

  methods: {
    fromNow (date) { return moment(date).fromNow() },
    getProfile (id) {
      this.status = 'loading'

      this.$http.get(`users/${id}`)
        .then(res => {
          this.user = res.data.list[0]
          this.isSelf = this.user._id === this.currentUser._id
          this.status = 'done'
        })
        .catch(err => {
          this.status = 'error'
          console.log(err)
          if (err.status === 404) this.$router.replace({ name: 'error', query: { type: 'not_found' } })
        })
    },
    getApps (userId) {
      if (this.loadingApps === 'loading') return
      this.loadingApps = 'loading'

      const params = {
        organization: this.school._id,
        amount: 0,
        follower: userId,
        sort: 'toolName',
        order: 1
      }

      this.$http.get('pages', { params }).then(
        res => {
          this.apps = res.data.list
          this.loadingApps = 'done'
        }).catch(() => { this.loadingApps = 'error' })
    },
    toggleEmailDialog () { this.dialogEmail = !this.dialogEmail },
    logout () {
      this.$http.post('users/logout', {})
        .then(() => {
          sessionStorage.removeItem('origin')
          if (window.fcWidget) window.fcWidget.destroy()
          removeCsrfToken()
          window.location.assign('/')
        })
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
