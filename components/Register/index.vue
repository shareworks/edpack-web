<template>
  <section v-if="!checkLoading" class="form-register bottom" v-observe-visibility="{callback: visibilityChanged, throttle: 100, once: true}">
    <!-- Access token expired -->
    <div v-if="!userTokenValid">
      <h2>{{ $t('SW_TOKEN_EXPIRED') }}</h2>
      <p>{{ $t('SW_TOKEN_EXPIRED_TEXT', [school.terminology.instructor[lang].toLowerCase()]) }}</p>
    </div>

    <transition v-else name="login" mode="out-in">
      <!-- Login by google -->
      <div class="login" :key="'google'" v-if="!passwordMode">
        <div>
          <p class="mb-20">{{ $t('SW_REGISTER_TEXT', [appName]) }}</p>

          <div v-if="loginMethods.includes('saml')">
            <p class="title"><strong>{{ $t('SW_REGISTER_SCHOOL') }}</strong></p>

            <!-- School selection -->
            <el-select class="block" v-model="selectedSchool" filterable :placeholder="$t('SW_SELECT_YOUR_SCHOOL')" @change="selectSchool"
                       :no-data-text="$t('SW_NO_DATA')" :no-match-text="$t('SW_NO_SCHOOLS_FOUND')" :loading-text="$t('SW_LOADING')">
              <el-option v-for="(item, index) in schools" :key="index" :value="item">
                <i class="icon-school"/>
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>

            <!-- or -->
            <div class="login-or">{{$t('SW_OR')}}</div>
          </div>

          <!-- Register with Google account -->
          <el-button class="block no-margin" @click="selectGoogle" v-if="loginMethods.includes('google')">
            <span class="google-icon"></span>
            <strong>{{ $t('SW_REGISTER_WITH_GOOGLE') }}</strong>
          </el-button>

          <!-- Register with MS account -->
          <el-button class="block no-margin mt-5" @click="selectMicrosoft" v-if="loginMethods.includes('microsoft')">
            <span class="ms-icon"></span>
            <strong>{{ $t('SW_REGISTER_WITH_MS') }}</strong>
          </el-button>

          <div v-if="loginMethods.includes('loginByPassword')">
            <!-- or Sign in By Password -->
            <div class="login-or">{{$t('SW_OR')}}</div>

            <!-- Register with new password -->
            <div>
              <p class="title"><strong>{{$t(recoverToken ? 'SW_RESET_BY_ACCOUNT' : 'SW_ACCEPT_BY_ACCOUNT', [appName]) }}</strong></p>

              <!-- Password -->
              <el-input @keyup.enter.native="submitPassword" type="password" :placeholder="$t('SW_YOUR_PASSWORD', [appName])" prefix-icon="icon-lock" id="password" v-model="form.password"/>
              <!-- Password strength meter -->
              <password v-model="form.password" :strengthMeterOnly="true"/>
              <!-- Repeat Password -->
              <el-input @keyup.enter.native="submitPassword" type="password" :placeholder="$t('SW_REPEAT_YOUR_PASSWORD')" prefix-icon="icon-lock" id="reset-password" class="mb-10"  v-model="repeatPassword"/>

              <el-button class="mb-10 block" :loading="submitting" type="primary" @click="submitPassword">
                {{ $t('SW_ACCEPT_SIGN_IN') }}
                <i class="icon-arrow_forward"/>
              </el-button>
            </div>
          </div>
        </div>

        <el-alert class="mt-10" type="error" show-icon v-if="errorType" :title="$t('SW_' + errorType.toUpperCase())"/>

        <div class="login-statement font-12">
          <span class="hidden-xs">{{ $t('SW_LOGIN_STATEMENT', [appName]) }} </span>
          <a :href="aboutUrl ? aboutUrl : businessUrl" target="_blank">{{ businessName }}</a>
          {{ $t('SW_LOGIN_STATEMENT2') }}

          <!-- Links -->
          <router-link to="/terms">{{ $t('SW_TERMS').toLowerCase() }}</router-link> & <router-link to="/privacy">{{ $t('SW_PRIVACY').toLowerCase() }}</router-link>.
        </div>
      </div>

      <!-- Error alert -->
      <el-alert class="mt-10" type="error" show-icon v-if="errorType" :title="$t('SW_' + errorType.toUpperCase())"/>
    </transition>
  </section>

  <!-- Loading -->
  <spinner v-else/>
</template>

<script>
import config from 'config'
import Password from 'vue-password-strength-meter'
import showErrorMessage from '@/edpack-web/utils/show-error-message'
import basicVisibilityChanged from '@/edpack-web/utils/basic-visibility-changed'

export default {
  name: 'Register',
  components: { Password },

  data () {
    return {
      loginMethods: [],
      accessToken: this.$route.query.accessToken || '',
      recoverToken: this.$route.query.recoverToken || '',
      organizationId: this.$route.query.organization || '',
      courseId: this.$route.query.course || '',
      evaluationId: this.$route.query.evaluation || '',
      assessmentId: this.$route.query.assessment || '',
      role: this.$route.query.role || '',
      apiUrl: config.api_url,
      passwordMode: false,
      submitting: false,
      selectedSchool: '',
      loading: false,
      schools: [],
      errorType: this.$route.query.error,
      businessUrl: config.business.url,
      aboutUrl: config.aboutUrl,
      appName: config.name,
      businessName: config.business.shortName,
      school: this.$store.state.school,
      lang: this.$store.state.lang,
      repeatPassword: '',
      form: { password: '' },
      userTokenValid: true,
      checkLoading: false
    }
  },

  mounted () {
    this.$http.get('/auth/saml/identity-providers')
      .then((res) => { this.schools = res.data.list })
      .catch(() => { this.$message({ message: this.$i18n.t('SW_COULD_NOT_GET_IDP'), type: 'error' }) })

    this.checkInvitation()
  },

  methods: {
    checkInvitation () {
      if (this.checkLoading) return
      this.checkLoading = true

      this.$http.get(`organizations/${this.organizationId}/check-invitation/${this.accessToken}`)
        .then(res => {
          const result = res.data.list[0]
          this.userTokenValid = result.userTokenValid
          this.loginMethods = result.loginMethods
        })
        .catch(err => { showErrorMessage(this, err) })
        .finally(() => { this.checkLoading = false })
    },
    selectSchool (school) {
      let redirect = this.$route.query.redirect || ''
      if (redirect[0] === '/') redirect = redirect.substr(1)
      window.location.assign(`${this.apiUrl}/auth/saml?name=${school.name}&entrypoint=${school.url}&redirectpath=${redirect}`)
    },
    selectGoogle () {
      let redirect = this.$route.query.redirect || ''
      if (redirect[0] === '/') redirect = redirect.substr(1)
      window.location.assign(`${this.apiUrl}/auth/google?redirectpath=${redirect}`)
    },
    selectMicrosoft () {
      let redirect = this.$route.query.redirect || ''
      if (redirect[0] === '/') redirect = redirect.substr(1)
      window.location.assign(`${this.apiUrl}/auth/microsoft?redirectpath=${redirect}`)
    },
    submitPassword () {
      if (!this.form.password || !this.repeatPassword) return this.$message({ message: this.$i18n.t('SW_PASSWORD_INCOMPLETE'), type: 'error' })
      if (!this.accessToken || !this.organizationId) return this.$message({ message: this.$i18n.t('SW_MISSING_REGISTER_TOKENS'), type: 'error' })
      if (this.form.password !== this.repeatPassword) {
        this.form.password = ''
        this.repeatPassword = ''
        return this.$message({ message: this.$i18n.t('SW_PASSWORD_MISMATCH'), type: 'error' })
      }

      if (this.submitting) return
      this.submitting = true

      // Post password here to API
      this.$http.post('/auth/local/password', this.form, { params: { accessToken: this.accessToken, organization: this.organizationId } })
        .then(() => {
          this.$message({ message: this.$i18n.t('SW_INVITATION_COMPLETED', [this.appName]), type: 'success' })
          if (this.role && (this.evaluationId || this.courseId)) {
            let pagelinkUrl = `${this.apiUrl}/pagelink/redirect?role=${this.role}&organization=${this.organizationId}`
            if (this.evaluationId) pagelinkUrl = `${pagelinkUrl}&evaluation=${this.evaluationId}`
            if (this.assessmentId) pagelinkUrl = `${pagelinkUrl}&assessment=${this.assessmentId}`
            if (this.courseId) pagelinkUrl = `${pagelinkUrl}&course=${this.courseId}`
            window.location.assign(pagelinkUrl)
          } else {
            this.$router.push('/').catch(() => {})
          }
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
