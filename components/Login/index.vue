<template>
  <section class="form-login bottom" v-observe-visibility="{ callback: visibilityChanged, throttle: 100, once: true }">
    <transition name="login" mode="out-in">
      <div class="login" :key="'google'" v-if="!passwordMode">
        <div>
          <el-alert v-if="serverStatus === 'offline'" class="mb-10" center :title="$t('SW_SERVER_OFFLINE')" type="error" :closable="false"></el-alert>
          <p class="title"><strong>{{ $t('SW_LOGIN_SCHOOL') }}</strong></p>

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

          <!-- Sign in by password -->
          <el-button class="mb-10 block" type="primary" plain @click="passwordMode = true" v-if="signinByPassword">
            <i class="icon-user"></i>
            {{ $t('SW_SIGN_IN_BY_PASSWORD') }}
          </el-button>

          <!-- Google log in -->
          <el-button class="block no-margin" @click="selectGoogle">
            <span class="google-icon"></span>
            <strong>{{ $t('SW_LOG_IN_WITH_GOOGLE') }}</strong>
          </el-button>
        </div>

        <el-alert class="mt-10" type="error" show-icon v-if="errorType" :title="$t('SW_' + errorType.toUpperCase())"></el-alert>

        <div class="login-statement">
          <span class="hidden-xs">{{ $t('SW_LOGIN_STATEMENT', [appName]) }} </span>
          <a :href="aboutUrl ? aboutUrl : businessUrl" target="_blank">{{ businessName }}</a>
          {{ $t('SW_LOGIN_STATEMENT2') }}
          <router-link to="/terms">{{ $t('SW_TERMS').toLowerCase() }}</router-link> & <router-link to="/privacy">{{ $t('SW_PRIVACY').toLowerCase() }}</router-link>.
        </div>
      </div>

      <div class="login" :key="'password'" v-if="passwordMode">
        <!--  Email/password form -->
        <div>
          <el-button type="text" size="small" class="close-password" @click="passwordMode = false">&times;</el-button>

          <p class="title"><strong>{{$t('SW_SIGN_IN_BY_ACCOUNT', [appName]) }}</strong></p>
          <el-input @keyup.enter.native="submitPassword" type="email" :placeholder="$t('SW_YOUR_EMAIL_SHORT')" name="email" id="login-email" prefix-icon="icon-email" v-model="form.email"></el-input>
          <el-input @keyup.enter.native="submitPassword" type="password" :placeholder="$t('SW_YOUR_PASSWORD', [appName])" name="password" id="login-password" prefix-icon="icon-lock" class="mb-10" v-model="form.password"></el-input>

          <el-button class="mb-10 block" :loading="submitting" type="primary" @click="submitPassword">
            {{ $t('SW_LOGIN') }}
            <i class="icon-arrow_forward"></i>
          </el-button>

          <div class="text-center">
            <el-button type="text" @click="$router.push({name: 'forgot', query: { email: form.email }})" size="small">{{ $t('SW_FORGOT_PASSWORD') }}</el-button>
          </div>
        </div>

        <el-alert class="mt-10" type="error" show-icon v-if="errorType" :title="$t('SW_' + errorType.toUpperCase())"></el-alert>

        <div class="login-statement">
          <span class="hidden-xs">{{ $t('SW_LOGIN_STATEMENT', [appName]) }} </span>
          <a :href="aboutUrl ? aboutUrl : businessUrl" target="_blank">{{ businessName }}</a>
          {{ $t('SW_LOGIN_STATEMENT2') }}
          <router-link to="/terms">{{ $t('SW_TERMS').toLowerCase() }}</router-link> & <router-link to="/privacy">{{ $t('SW_PRIVACY').toLowerCase() }}</router-link>.
        </div>

      </div>
    </transition>

  </section>
</template>

<script>
import config from 'config'

export default {
  name: 'Login',
  components: {},

  data () {
    return {
      appName: config.name,
      apiUrl: config.api_url,
      signinByPassword: config.signinByPassword,
      passwordMode: false,
      submitting: false,
      selectedSchool: '',
      loading: false,
      schools: [],
      errorType: this.$route.query.error,
      businessUrl: config.business.url,
      aboutUrl: config.aboutUrl,
      businessName: config.business.shortName,
      form: { email: '', password: '' },
      serverStatus: 'loading'
    }
  },

  mounted () {
    this.checkConnection()
    this.$http.get('/auth/saml/identity-providers')
      .then((res) => { this.schools = res.data.list })
      .catch(() => { this.$message({ message: this.$i18n.t('SW_COULD_NOT_GET_IDP'), type: 'error' }) })
  },

  methods: {
    checkConnection () {
      this.$http.get('status')
        .then(() => { this.serverStatus = 'online' })
        .catch(() => { this.serverStatus = 'offline' })
    },
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
    submitPassword () {
      if (config.mock_user) return this.$router.push('/admin')
      if (!this.form.password || !this.form.email) return this.$message({ message: this.$i18n.t('SW_EMAIL_PASSWORD_INCOMPLETE'), type: 'error' })

      if (this.submitting) return
      this.submitting = true

      this.$http.post('/auth/local/login', this.form)
        .then(() => {
          const redirect = this.$route.query.redirect || 'home'
          this.$router.push(redirect)
        })
        .catch(() => {
          this.$message({ message: this.$i18n.t('SW_EMAIL_PASSWORD_INCORRECT'), type: 'error' })
          this.form.password = ''
        })
        .finally(() => { this.submitting = false })
    },
    visibilityChanged (isVisible, entry) {
      const { target } = entry
      if (isVisible) {
        target.classList.remove('bottom')
        target.classList.add('top')
      }
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
