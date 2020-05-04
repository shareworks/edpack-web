<template>
  <div class="login invisible" v-observe-visibility="{callback: visibilityChanged, throttle: 100, once: true}">
    <p class="title"><strong>{{ $t('SW_LOGIN') }}</strong></p>

    <!-- School selection -->
    <el-select class="block"
               v-model="selectedSchool"
               filterable
               :placeholder="$t('SW_SELECT_YOUR_SCHOOL')"
               @change="selectSchool"
               :no-data-text="$t('SW_NO_DATA')"
               :no-match-text="$t('SW_NO_SCHOOLS_FOUND')"
               :loading-text="$t('SW_LOADING')">
      <el-option v-for="(item, index) in schools" :key="index" :value="item">
        <i class="icon-school"></i>
        <span>{{ item.name }}</span>
      </el-option>
    </el-select>

    <!-- or -->
    <div class="login-or">{{$t('SW_OR')}}</div>

    <!-- Google log in -->
    <el-button class="block" @click="selectGoogle">
      <span class="google-icon"></span>
      <strong>{{ $t('SW_LOG_IN_WITH_GOOGLE') }}</strong>
    </el-button>

    <el-alert class="mt-10" type="error" show-icon v-if="errorType" :title="$t('SW_' + errorType.toUpperCase())"></el-alert>

    <div class="login-statement">
      <span class="hidden-xs">{{ $t('SW_LOGIN_STATEMENT') }} </span>
      <a :href="businessUrl" target="_blank">{{ businessName }}</a>
      {{ $t('SW_LOGIN_STATEMENT2') }}
      <router-link to="/terms">{{ $t('SW_TERMS').toLowerCase() }}</router-link> & <router-link to="/privacy">{{ $t('SW_PRIVACY').toLowerCase() }}</router-link>.
    </div>

  </div>
</template>

<script>
import config from 'config'

export default {
  name: 'Login',
  components: {},

  data () {
    return {
      apiUrl: config.api_url,
      selectedSchool: '',
      loading: false,
      schools: [],
      filteredList: [],
      errorType: this.$route.query.error,
      businessUrl: config.business.url,
      businessName: config.business.shortName
    }
  },

  mounted () {
    this.$http.get('/auth/saml/identity-providers')
      .then((res) => { this.schools = res.data.list })
      .catch(() => { this.$message({ message: this.$i18n.t('SW_COULD_NOT_GET_IDP'), type: 'error' }) })
  },

  methods: {
    selectSchool (school) {
      let redirect = this.$route.query.redirect || ''
      if (redirect[0] === '/') redirect = redirect.substr(1)
      window.location.assign(`${this.apiUrl}/auth/saml?name=${school.name}&entrypoint=${school.url}&redirectpath=${redirect}`)
    },
    selectGoogle () {
      if (config.mock_user) return this.$router.push('/admin')

      let redirect = this.$route.query.redirect || ''
      if (redirect[0] === '/') redirect = redirect.substr(1)
      window.location.assign(`${this.apiUrl}/auth/google?redirectpath=${redirect}`)
    },
    visibilityChanged (isVisible, entry, count) {
      const { target } = entry
      if (isVisible) {
        target.classList.remove('invisible')
        target.classList.add('visible')
      }
      if (count && isVisible) {
        setTimeout(() => {
          this.$refs.counts[count.index].start()
        }, this.countAnimationDelay)
      }
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
