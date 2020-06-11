<template>
  <section class="form-register bottom" v-observe-visibility="{callback: visibilityChanged, throttle: 100, once: true}">

    <transition name="login" mode="out-in">
      <div class="login" :key="'google'" v-if="!passwordMode">
        <div>
          <p class="mb-20">{{ $t('SW_REGISTER_TEXT') }}</p>

          <p class="title"><strong>{{ $t('SW_REGISTER_SCHOOL') }}</strong></p>

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
          <div class="login-or" v-if="signinByPassword">{{$t('SW_OR')}}</div>

          <!-- Register with new password -->
          <div v-if="signinByPassword">
            <p class="title"><strong>{{$t(recoverToken ? 'SW_RESET_BY_ACCOUNT' : 'SW_ACCEPT_BY_ACCOUNT') }}</strong></p>

            <el-input @keyup.enter.native="submitPassword" type="password" :placeholder="$t('SW_YOUR_PASSWORD')" prefix-icon="icon-lock" id="password" v-model="form.password"></el-input>
            <password v-model="form.password" :strengthMeterOnly="true"/>
            <el-input @keyup.enter.native="submitPassword" type="password" :placeholder="$t('SW_REPEAT_YOUR_PASSWORD')" prefix-icon="icon-lock" id="reset-password" class="mb-10"  v-model="repeatPassword"></el-input>

            <el-button class="mb-10 block" :loading="submitting" type="primary" @click="submitPassword">
              {{ $t('SW_ACCEPT_SIGN_IN') }}
              <i class="icon-arrow_forward"></i>
            </el-button>
          </div>

          <!-- or -->
          <div class="login-or">{{$t('SW_OR')}}</div>

          <!-- Register with Google account -->
          <el-button class="block no-margin" @click="selectGoogle">
            <span class="google-icon"></span>
            <strong>{{ $t('SW_REGISTER_WITH_GOOGLE') }}</strong>
          </el-button>
        </div>

        <el-alert class="mt-10" type="error" show-icon v-if="errorType" :title="$t('SW_' + errorType.toUpperCase())"></el-alert>

        <div class="login-statement">
          <span class="hidden-xs">{{ $t('SW_LOGIN_STATEMENT') }} </span>
          <a :href="aboutUrl ? aboutUrl : businessUrl" target="_blank">{{ businessName }}</a>
          {{ $t('SW_LOGIN_STATEMENT2') }}
          <router-link to="/terms">{{ $t('SW_TERMS').toLowerCase() }}</router-link> & <router-link to="/privacy">{{ $t('SW_PRIVACY').toLowerCase() }}</router-link>.
        </div>
      </div>

      <el-alert class="mt-10" type="error" show-icon v-if="errorType" :title="$t('SW_' + errorType.toUpperCase())"></el-alert>
    </transition>
  </section>
</template>

<script>
import config from 'config'
import Password from 'vue-password-strength-meter'

export default {
  name: 'Register',
  components: { Password },

  data () {
    return {
      accessToken: this.$route.query.accessToken || '',
      recoverToken: this.$route.query.recoverToken || '',
      organizationId: this.$route.query.organization || '',
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
      repeatPassword: '',
      form: { password: '' }
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
    submitPassword () {
      if (config.mock_user) return this.$router.push('/admin')
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
          this.$message({ message: this.$i18n.t('SW_INVITATION_COMPLETED'), type: 'success' })
          this.$router.push('/')
        })
        .catch(() => {
          this.$message({ message: this.$i18n.t('SW_PASSWORD_INCORRECT'), type: 'error' })
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
