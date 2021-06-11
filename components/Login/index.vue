<template>
  <section class="form-login bottom" v-observe-visibility="{ callback: visibilityChanged, throttle: 100, once: true }">
    <transition name="login" mode="out-in">
      <!-- Main screen where you choose the way to login -->
      <div class="login" :key="'google'" v-if="!passwordMode">
        <div>
          <el-alert v-if="serverStatus === 'offline'" class="mb-10" center :title="$t('SW_SERVER_OFFLINE')" type="error" :closable="false"/>

          <p v-if="selectedSchool" class="title mb-10"><strong>{{ $t('SW_LOGIN_TO_SELECTED_SCHOOL', [appName, selectedSchool.name]) }}</strong></p>
          <p v-else class="title"><strong>{{ $t('SW_LOGIN_SCHOOL') }}</strong></p>

          <p v-if="selectedSchool" class="title mb-10">{{ $t('SW_SIGN_IN_TITLE') }}</p>

          <div v-if="!selectedSchool">
            <!-- School selection -->
            <el-select :value="selectedSchool" class="block" filterable :placeholder="$t('SW_SELECT_YOUR_SCHOOL')"
                       @change="selectSchool" :no-data-text="$t('SW_NO_DATA')" :no-match-text="$t('SW_NO_SCHOOLS_FOUND')"
                       :loading-text="$t('SW_LOADING')">
              <el-option v-for="(item, index) in schools" :key="index" :value="item">
                <i class="icon-school"/>
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>

            <!-- or -->
            <div class="login-or">{{$t('SW_OR')}}</div>
          </div>

          <!-- MS log in -->
          <el-button v-if="signinWithMS" :disabled="submitting" class="block mb-5 no-margin" @click="selectMicrosoft">
            <span class="ms-icon"/>
            <strong>{{ $t('SW_LOG_IN_WITH_MS') }}</strong>
          </el-button>

          <!-- Google log in -->
          <el-button v-if="signInWithGoogle" :disabled="submitting" class="block no-margin" @click="selectGoogle">
            <span class="google-icon"/>
            <strong>{{ $t('SW_LOG_IN_WITH_GOOGLE') }}</strong>
          </el-button>

          <!-- Sign in by password -->
          <el-button v-if="signinByPassword" :disabled="submitting" class="mt-10 block no-margin" type="primary" plain @click="passwordMode = true">
            <i class="icon-user"/>
            {{ $t('SW_SIGN_IN_BY_PASSWORD') }}
          </el-button>
        </div>

        <!-- Loading -->
        <spinner class="mt-30" v-if="submitting"/>

        <!-- Error alert -->
        <el-alert class="mt-10" type="error" show-icon v-if="errorType" :title="$t('SW_' + errorType.toUpperCase())"/>

        <!-- Login statement -->
        <div class="login-statement font-12">
          <span class="hidden-xs">{{ $t('SW_LOGIN_STATEMENT', [appName]) }} </span>
          <a :href="aboutUrl ? aboutUrl : businessUrl" target="_blank">{{ businessName }}</a>
          {{ $t('SW_LOGIN_STATEMENT2') }}

          <!-- Links -->
          <router-link to="/terms">{{ $t('SW_TERMS').toLowerCase() }}</router-link> & <router-link to="/privacy">{{ $t('SW_PRIVACY').toLowerCase() }}</router-link>.
        </div>
      </div>

      <div class="login" :key="'password'" v-if="passwordMode">
        <!--  Email/password form -->
        <div>
          <el-button type="text" size="small" class="close-password" @click="passwordMode = false">&times;</el-button>

          <p class="title"><strong>{{ selectedSchool ? $t('SW_LOGIN_TO_SELECTED_SCHOOL', [appName, selectedSchool.name]) : $t('SW_SIGN_IN_BY_ACCOUNT', [appName]) }}</strong></p>
          <el-input @keyup.enter.native="submitPassword" type="email" :placeholder="$t('SW_YOUR_EMAIL_SHORT')" name="email" id="login-email" prefix-icon="icon-email" v-model="form.email"/>
          <el-input @keyup.enter.native="submitPassword" type="password" :placeholder="$t('SW_YOUR_PASSWORD', [appName])" name="password" id="login-password" prefix-icon="icon-lock" class="mb-10" v-model="form.password"/>

          <!-- Login -->
          <el-button class="mb-10 block" :loading="submitting" type="primary" @click="submitPassword">
            {{ $t('SW_LOGIN') }}
            <i class="icon-arrow_forward"/>
          </el-button>

          <!-- Forgot password -->
          <div class="text-center">
            <el-button type="text" @click="$router.push({name: 'forgot', query: { email: form.email }})" size="small" :aria-label="$t('SW_FORGOT_PASSWORD')">{{ $t('SW_FORGOT_PASSWORD') }}</el-button>
          </div>

          <!-- Request password -->
          <div class="text-center" v-if="showRequestPasswordLink">
            <el-button type="text" @click="$router.push({name: 'forgot', query: { email: form.email, requestPassword: 'true' }})" size="small" :aria-label="$t('SW_REQUEST_PASSWORD')">{{ $t('SW_REQUEST_PASSWORD') }}</el-button>
          </div>
        </div>

        <!-- Error alert -->
        <el-alert class="mt-10" type="error" show-icon v-if="errorType" :title="$t('SW_' + errorType.toUpperCase())"/>

        <!-- Login statement -->
        <div class="login-statement font-12">
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
import basicVisibilityChanged from '@/edpack-web/utils/basic-visibility-changed'

export default {
  name: 'Login',

  data () {
    return {
      appName: config.name,
      apiUrl: config.api_url,
      showRequestPasswordLink: config.showRequestPasswordLink,
      passwordMode: false,
      submitting: false,
      schools: [],
      errorType: this.$route.query.error,
      businessUrl: config.business.url,
      aboutUrl: config.aboutUrl,
      businessName: config.business.shortName,
      form: { email: '', password: '' },
      serverStatus: 'loading',
      selectedSchool: null,
      lmsList: ['canvas', 'brightspace', 'blackboard', 'moodle', 'ilearn']
    }
  },

  computed: {
    signInWithGoogle () { return !this.selectedSchool || this.selectedSchool.loginMethods.includes('google') },
    signinWithMS () { return !this.selectedSchool || this.selectedSchool.loginMethods.includes('microsoft') },
    signinByPassword () { return !this.selectedSchool || this.selectedSchool.loginMethods.includes('loginByPassword') }
  },

  watch: {
    $route (to) {
      if (to.query.schoolId) {
        const targetSchool = this.schools.find((school) => school._id === to.query.schoolId)
        if (targetSchool) this.selectSchool(targetSchool)
      } else {
        this.selectedSchool = null
      }
    }
  },

  mounted () {
    this.$http.get('/auth/saml/identity-providers')
      .then((res) => {
        this.schools = res.data.list

        if (this.$route.query.schoolId) {
          const targetSchool = this.schools.find((school) => school._id === this.$route.query.schoolId)
          if (targetSchool) this.selectSchool(targetSchool)
        }
      })
      .catch(() => { this.$message({ message: this.$i18n.t('SW_COULD_NOT_GET_IDP'), type: 'error' }) })
  },

  methods: {
    selectSchool (school) {
      this.submitting = true
      this.selectedSchool = school
      let redirect = this.$route.query.redirect || ''
      if (redirect[0] === '/') redirect = redirect.substr(1)

      if (school.loginMethods.includes('saml')) {
        window.location.assign(`${this.apiUrl}/auth/saml?name=${school.name}&entrypoint=${school.url}&redirectpath=${redirect}`)
      } else {
        // filter all methods to remove 'canvas', 'brightspace' and so on
        const customLoginMethods = school.loginMethods.filter(method => !this.lmsList.includes(method))
        const justOneMethodExist = customLoginMethods.length === 1

        // just password mode available -> show it
        if (justOneMethodExist && customLoginMethods[0] === 'loginByPassword') {
          this.passwordMode = true
          const route = { name: 'landing', query: { schoolId: school._id } }
          this.$router.push(route)

        // just google mode available -> open it
        } else if (justOneMethodExist && customLoginMethods[0] === 'google') {
          this.selectGoogle()

        // just microsoft mode available -> open it
        } else if (justOneMethodExist && customLoginMethods[0] === 'microsoft') {
          this.selectMicrosoft()

        // user has a multiple ways to login, show it
        } else {
          const route = { name: 'landing', query: { schoolId: school._id } }
          this.$router.push(route)
        }

        this.submitting = false
      }
    },
    selectGoogle () {
      if (config.mock_user) return this.$router.push('/admin')

      let redirect = this.$route.query.redirect || ''
      if (redirect[0] === '/') redirect = redirect.substr(1)
      window.location.assign(`${this.apiUrl}/auth/google?redirectpath=${redirect}`)
    },
    selectMicrosoft () {
      if (config.mock_user) return this.$router.push('/admin')

      let redirect = this.$route.query.redirect || ''
      if (redirect[0] === '/') redirect = redirect.substr(1)
      window.location.assign(`${this.apiUrl}/auth/microsoft?redirectpath=${redirect}`)
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
        .catch((err) => {
          this.form.password = ''
          let errorString = 'SW_GENERIC_ERROR'
          const errorTranslation = err?.data?.errors[0]?.translation
          if (errorTranslation) errorString = 'SW_' + errorTranslation

          this.$message({ message: this.$i18n.t(errorString), type: 'error' })
        })
        .finally(() => { this.submitting = false })
    },
    visibilityChanged (isVisible, entry) {
      basicVisibilityChanged(isVisible, entry, 'bottom', 'top')
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
