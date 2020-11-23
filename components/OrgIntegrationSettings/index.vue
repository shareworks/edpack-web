<template>
  <div>
    <el-alert :title="$t('SW_INTEGRATIONS_INFO_TITLE', [appName])" class="mb-30" :description="$t('SW_INTEGRATIONS_INFO_TEXT', [appName])" type="info" show-icon/>
    <!-- Show credentials in UI -->
    <el-switch v-model="hideCredentials" active-color="#13ce66" inactive-color="#ff4949" class="mb-20" :active-text="$t('SW_VIEW_CREDENTIALS')"></el-switch>

    <!--Email domains-->
    <el-alert class="mb-10" show-icon v-if="incorrectDomains.length" type="error" :title="$tc('SW_DOMAINS_NOT_CORRECT', incorrectDomains.length)">
      <ul>
        <li v-for="domain in incorrectDomains" :key="domain">
          <span class="bold">{{ domain }}</span>
        </li>
      </ul>
    </el-alert>

    <el-form-item :label="$t('SW_EMAIL_DOMAINS')" required>
      <el-tag v-for="domain in form.emailDomains" :key="domain" closable :disable-transitions="false" @close="handleClose('emailDomains', domain); domainsValidation()">
        {{ domain }}
      </el-tag>
      <el-input
              size="small"
              ref="emailDomains"
              class="inline ml-5"
              v-if="inputVisible.emailDomains"
              v-model="inputValue.emailDomains"
              placeholder="@role.your-school.com"
              @keyup.enter.native="handleInputConfirm('emailDomains')"
              @blur="handleInputConfirm('emailDomains'); domainsValidation()">
      </el-input>
      <el-button v-else size="small" class="ml-5" @click="showInput('emailDomains')">
        <i class="icon-add"></i>
        {{ $t('SW_NEW_DOMAIN') }}
      </el-button>
    </el-form-item>

    <!--Saml domains-->
    <el-form-item :label="$t('SW_SAML_DOMAINS')" required>
      <el-tag v-for="samlDomain in form.saml.domains" :key="samlDomain" closable :disable-transitions="false" @close="handleClose('samlDomains', samlDomain)">
        {{ samlDomain }}
      </el-tag>
      <el-input
              class="inline ml-5"
              size="small"
              v-if="inputVisible.samlDomains"
              v-model="inputValue.samlDomains"
              placeholder="saml-domain.edu"
              ref="samlDomains"
              @keyup.enter.native="handleInputConfirm('samlDomains')"
              @blur="handleInputConfirm('samlDomains')">
      </el-input>
      <el-button v-else size="small" class="ml-5" @click="showInput('samlDomains')">
        <i class="icon-add"></i>
        {{ $t('SW_NEW_SAML_DOMAIN') }}
      </el-button>
    </el-form-item>

    <!--Saml entity IDs-->
    <el-form-item :label="$t('SW_SAML_ENTITY_IDS')">
      <el-tag v-for="entity in form.saml.entityIds" :key="entity" closable :disable-transitions="false" @close="handleClose('samlEntityIds', entity)">
        {{ entity }}
      </el-tag>
      <el-input
              class="inline ml-5"
              size="small"
              v-if="inputVisible.samlEntityIds"
              v-model="inputValue.samlEntityIds"
              placeholder="https://www.saml-domain.edu/saml-login-url"
              ref="samlEntityIds"
              @keyup.enter.native="handleInputConfirm('samlEntityIds')"
              @blur="handleInputConfirm('samlEntityIds')">
      </el-input>
      <el-button v-else size="small" class="ml-5" @click="showInput('samlEntityIds')">
        <i class="icon-add"></i>
        {{ $t('SW_NEW_SAML_ENTITY_ID') }}
      </el-button>
    </el-form-item>

    <!-- Set Lti version-->
    <el-form-item label="LTI version">
      <el-radio-group v-model="form.lastConfiguredLtiVersion" size="small">
        <el-radio-button label="basic">LTI Basic (v1.1)</el-radio-button>
        <el-radio-button label="advantage">LTI Advantage (v1.3)</el-radio-button>
      </el-radio-group>
    </el-form-item>

    <!-- Lti Basic configuration -->
    <div v-if="form.lastConfiguredLtiVersion === 'basic'" class="mb-20">
      <!-- LTI config url -->
      <el-form-item label="LTI config URL">
        <el-input v-model="ltiConfigUrl" :readonly="true" type="url">
          <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
            <el-button v-clipboard="ltiConfigUrl" @success="clipboardSuccess">
              <i class="icon-copy"></i>
            </el-button>
          </el-tooltip>
        </el-input>
      </el-form-item>

      <!-- LTI key -->
      <el-form-item label="LTI key">
        <el-input v-model="form._id" :readonly="true" type="text">
          <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
            <el-button v-clipboard="form._id" @success="clipboardSuccess">
              <i class="icon-copy"></i>
            </el-button>
          </el-tooltip>
        </el-input>
      </el-form-item>

      <!-- LTI secret -->
      <el-form-item label="LTI secret">
        <el-input v-model="form.ltiBasic.secret" :readonly="true" :type="hideCredentials ? 'password' : 'text'" :placeholder="$t('SW_SECRET_PLACEHOLDER')">
          <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
            <el-button v-clipboard="form.ltiBasic.secret" @success="clipboardSuccess">
              <i class="icon-copy"></i>
            </el-button>
          </el-tooltip>

          <el-tooltip slot="append" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_GENERATE_SECRET_TEXT')" placement="bottom-end">
            <el-button @click="generateSecret">
              <i class="icon-repeat"></i>
              {{ $t('SW_GENERATE') }}
            </el-button>
          </el-tooltip>
        </el-input>

        <el-alert v-if="generatedSecretAlert && form.isChanged" class="mt-10" show-icon center :title="$t('SW_GENERATED_KEY_ALERT')" type="warning" :closable="false"/>
      </el-form-item>
    </div>

    <!-- Lti Advantage configuration -->
    <div v-if="form.lastConfiguredLtiVersion === 'advantage'" class="mb-20">
      <!-- LTI config domain -->
      <el-form-item label="LTI domain url">
        <el-input v-model="ltiAdvantageDomainUrl" :readonly="true" type="url">
          <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
            <el-button v-clipboard="ltiAdvantageDomainUrl" @success="clipboardSuccess">
              <i class="icon-copy"></i>
            </el-button>
          </el-tooltip>
        </el-input>
      </el-form-item>

      <!-- LTI config Redirect Urls -->
      <el-form-item label="LTI redirect url">
        <el-input v-model="ltiAdvantageRedirectUrl" :readonly="true" type="url">
          <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
            <el-button v-clipboard="ltiAdvantageRedirectUrl" @success="clipboardSuccess">
              <i class="icon-copy"></i>
            </el-button>
          </el-tooltip>
        </el-input>
      </el-form-item>

      <!-- LTI config Redirect Urls -->
      <el-form-item label="LTI login url">
        <el-input v-model="ltiAdvantageLoginUrl" :readonly="true" type="url">
          <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
            <el-button v-clipboard="ltiAdvantageLoginUrl" @success="clipboardSuccess">
              <i class="icon-copy"></i>
            </el-button>
          </el-tooltip>
        </el-input>
      </el-form-item>

      <!-- LTI config Keyset Url -->
      <el-form-item label="LTI keyset url">
        <el-input v-model="ltiAdvantageKeysetUrl" :readonly="true" type="url">
          <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
            <el-button v-clipboard="ltiAdvantageKeysetUrl" @success="clipboardSuccess">
              <i class="icon-copy"></i>
            </el-button>
          </el-tooltip>
        </el-input>
      </el-form-item>
    </div>

    <!-- Enable API Integration -->
    <el-form-item class="mb-10" :label="$t('SW_TOGGLE_API_INTEGRATION')">
      <el-switch v-model="form.lmsApiIntegration" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
      <span class="text-muted ml-10">{{ $t('SW_TOGGLE_API_INTEGRATION_TEXT' )}}</span>
    </el-form-item>

    <el-collapse-transition>
      <div v-show="form.lmsApiIntegration">
        <!-- API integration LMS -->
        <el-form-item :label="$t('SW_LMS_API_INTEGRATION')">
          <el-radio-group v-model="form.lastConfiguredLms" size="small">
            <el-radio-button v-for="integration in integrations" :key="integration" class="capitalize" :label="integration"/>
          </el-radio-group>
        </el-form-item>

        <div v-if="form.lastConfiguredLms !== 'moodle'">
          <!-- URL -->
          <el-form-item :label="apiTemplate[form.lastConfiguredLms].name + ' URL'" v-if="apiTemplate[form.lastConfiguredLms].apiUrl.status">
            <el-input @change="processHttp" v-model="form[form.lastConfiguredLms].apiUrl" type="url" :placeholder="apiTemplate[form.lastConfiguredLms].apiUrl.placeholder"/>
          </el-form-item>

          <!-- Callback url -->
          <el-form-item :label="apiTemplate[form.lastConfiguredLms].name + ' Callback URI'" v-if="apiTemplate[form.lastConfiguredLms].callbackUrl.status">
            <el-input v-model="this[apiTemplate[form.lastConfiguredLms].name.toLowerCase() + 'CallbackUrl']" :readonly="true" type="url">
              <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
                <el-button v-clipboard="canvasCallbackUrl" @success="clipboardSuccess">
                  <i class="icon-copy"></i>
                </el-button>
              </el-tooltip>
            </el-input>
          </el-form-item>

          <!-- App ID -->
          <el-form-item label="Application ID" v-if="apiTemplate[form.lastConfiguredLms].appId.status">
            <el-input v-model="form[form.lastConfiguredLms].appId">
              <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
                <el-button v-clipboard="form[form.lastConfiguredLms].appId">
                  <i class="icon-copy"></i>
                </el-button>
              </el-tooltip>
            </el-input>
          </el-form-item>

          <!-- key -->
          <el-form-item :label="apiTemplate[form.lastConfiguredLms].apiId.label" v-if="apiTemplate[form.lastConfiguredLms].apiId.status">
            <el-input v-model="form[form.lastConfiguredLms].apiId" type="text" :placeholder="apiTemplate[form.lastConfiguredLms].apiId.placeholder"/>
          </el-form-item>

          <!-- Secret -->
          <el-form-item :label="apiTemplate[form.lastConfiguredLms].apiSecret.label" v-if="apiTemplate[form.lastConfiguredLms].apiSecret.status">
            <el-input v-model="form[form.lastConfiguredLms].apiSecret" :type="hideCredentials ? 'password' : 'text'" :placeholder="form[form.lastConfiguredLms].apiSecret.placeholder"/>
          </el-form-item>

          <!-- Lti-advantage auth url -->
          <el-form-item :label="apiTemplate[form.lastConfiguredLms].advantageApiId.label" v-if="apiTemplate[form.lastConfiguredLms].advantageApiId.status">
            <el-input v-model="form[form.lastConfiguredLms].advantageApiId" :type="'text'" :placeholder="form[form.lastConfiguredLms].advantageApiId.placeholder"/>
          </el-form-item>

          <!-- Lti-advantage auth secret -->
          <el-form-item :label="apiTemplate[form.lastConfiguredLms].advantageApiSecret.label" v-if="apiTemplate[form.lastConfiguredLms].advantageApiSecret.status">
            <el-input v-model="form[form.lastConfiguredLms].advantageApiSecret" :type="'text'" :placeholder="form[form.lastConfiguredLms].advantageApiSecret.placeholder"/>
          </el-form-item>

          <!-- Lti-advantage auth url -->
          <el-form-item :label="apiTemplate[form.lastConfiguredLms].name + 'LTI v1.3 auth'" v-if="apiTemplate[form.lastConfiguredLms].advantageAuthUrl.status">
            <el-input v-model="form[form.lastConfiguredLms].advantageAuthUrl" :type="'text'" :placeholder="form[form.lastConfiguredLms].advantageAuthUrl.placeholder"/>
          </el-form-item>

          <!-- Ilearn ? Lti-advantage Deeplink-->
          <el-form-item :label="form[form.lastConfiguredLms].advantageDeeplinking.label" v-if="apiTemplate[form.lastConfiguredLms].advantageDeeplinking.status">
            <el-switch v-model="form[form.lastConfiguredLms].advantageDeeplinking" active-color="#13ce66" inactive-color="#ff4949"/>
            <span class="text-muted ml-10">{{ $t('SW_USE_DEEPLINK_TEXT' )}}</span>
          </el-form-item>
        </div>

        <el-alert v-else :title="$t('SW_NO_API_INTEGRATION_YET')" class="mb-30" :description="$t('SW_NO_API_INTEGRATION_YET_TEXT')" type="warning" show-icon/>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script>
import config from 'config'

export default {
  name: 'OrgIntegrationSettings',
  props: ['form'],

  data () {
    return {
      appName: config.name,
      school: this.$store.state.school,
      user: this.$store.state.user,
      lang: this.$store.state.lang,
      incorrectDomains: [],
      generatedSecretAlert: false,
      processing: false,
      inputVisible: {
        emailDomains: false,
        samlDomains: false,
        samlEntityIds: false
      },
      inputValue: {
        emailDomains: '',
        samlDomains: '',
        samlEntityIds: ''
      },
      hideCredentials: true,
      ltiConfigUrl: `${config.api_url}/lti`,
      canvasCallbackUrl: `${config.api_url}/auth/canvas/callback`,
      brightspaceCallbackUrl: `${config.api_url}/auth/brightspace/callback`,
      blackboardCallbackUrl: `${config.api_url}/auth/blackboard/callback`,
      iLearnCallbackUrl: `${config.api_url}/auth/ilearn/callback`,

      ltiAdvantageDomainUrl: `${config.api_url.replace('/api/v1', '')}`,
      ltiAdvantageRedirectUrl: `${config.api_url}/lti/advantage/launch`,
      ltiAdvantageLoginUrl: `${config.api_url}/lti/advantage/initiation`,
      ltiAdvantageKeysetUrl: `${config.api_url}/lti/advantage/jwks`,

      blackboardAppId: config.blackboardAppId,
      iLearn: config.iLearn,

      importantFields: ['canvas', 'brightspace', 'blackboard', 'ilearn'],
      integrations: ['canvas', 'brightspace', 'blackboard', 'moodle', 'ilearn'],
      apiTemplate: {
        canvas: {
          name: 'Canvas',
          apiUrl: { status: true, placeholder: 'ex. https://your-school.instructure.com ...' },
          callbackUrl: { status: true },
          appId: { status: false },
          apiId: { status: this.form.lastConfiguredLtiVersion === 'basic', label: 'Canvas key ID', placeholder: 'Canvas Developer Key ID ...' },
          apiSecret: { status: this.form.lastConfiguredLtiVersion === 'basic', label: 'Canvas key secret', placeholder: 'Canvas Developer Key Secret ...' },
          advantageApiId: { status: this.form.lastConfiguredLtiVersion === 'advantage', label: 'Canvas LTI v1.3 Key ID', placeholder: 'Canvas LTI v1.3 Key ID ...' },
          advantageApiSecret: { status: this.form.lastConfiguredLtiVersion === 'advantage', label: 'Canvas LTI v1.3 Key Secret', placeholder: 'Canvas LTI v1.3 Key Secret ...' },
          advantageAuthUrl: { status: this.form.lastConfiguredLtiVersion === 'advantage', placeholder: 'Canvas LTI v1.3 authorization url ...' },
          advantageDeeplinking: { status: false }
        },
        brightspace: {
          name: 'Brightspace',
          apiUrl: { status: true, placeholder: 'ex. https://your-school.brightspace.com/d2l ...' },
          callbackUrl: { status: true },
          appId: { status: false },
          apiId: { status: this.form.lastConfiguredLtiVersion === 'basic', label: 'Brightspace API client ID', placeholder: 'Brightspace OAuth Client ID ...' },
          apiSecret: { status: this.form.lastConfiguredLtiVersion === 'basic', label: 'Brightspace API client secret' },
          advantageApiId: { status: this.form.lastConfiguredLtiVersion === 'advantage', label: 'Brightspace LTI v1.3 client id', placeholder: 'Brightspace LTI v1.3 client id ...' },
          advantageApiSecret: { status: this.form.lastConfiguredLtiVersion === 'advantage', label: 'Brightspace LTI v1.3 client secret', placeholder: 'Brightspace LTI v1.3 client secret ...' },
          advantageAuthUrl: { status: this.form.lastConfiguredLtiVersion === 'advantage', placeholder: 'Brightspace LTI v1.3 authorization url ...' },
          advantageDeeplinking: { status: false }
        },
        blackboard: {
          name: 'Blackboard',
          apiUrl: { status: true, placeholder: 'ex. https://your-school.blackboard.com ...' },
          callbackUrl: { status: false },
          appId: { status: true, label: 'Blackboard Application ID', placeholder: 'Blackboard Application ID ...' },
          apiId: { status: true, label: 'Blackboard App key', placeholder: 'Blackboard App key ...' },
          apiSecret: { status: true, label: 'Blackboard App secret', placeholder: 'Blackboard App Secret ...' },
          advantageApiId: { status: false },
          advantageApiSecret: { status: false },
          advantageAuthUrl: { status: false },
          advantageDeeplinking: { status: false }
        },
        ilearn: {
          name: 'Ilearn',
          apiUrl: { status: true, placeholder: 'ex. https://your-school.ilearn.com ...' },
          callbackUrl: { status: false },
          appId: { status: false },
          apiId: { status: this.form.lastConfiguredLtiVersion === 'basic', label: 'iLearn App key', placeholder: 'iLearn App key ...' },
          apiSecret: { status: this.form.lastConfiguredLtiVersion === 'basic', label: 'iLearn App secret', placeholder: 'iLearn App Secret ...' },
          advantageApiId: { status: this.form.lastConfiguredLtiVersion === 'advantage', label: 'iLearn LTI v1.3 client id', placeholder: 'iLearn LTI v1.3 client id ...' },
          advantageApiSecret: { status: this.form.lastConfiguredLtiVersion === 'advantage', label: 'iLearn LTI v1.3 client secret', placeholder: 'iLearn LTI v1.3 client secret ...' },
          advantageAuthUrl: { status: this.form.lastConfiguredLtiVersion === 'advantage', label: 'iLearn LTI v1.3 auth', placeholder: 'iLearn LTI v1.3 authorization url ...' },
          advantageDeeplinking: { status: this.form.lastConfiguredLtiVersion === 'advantage', label: 'iLearn LTI v1.3 deeplinking' }
        }
      }
    }
  },
  watch: {
    form: {
      deep: true,
      handler () { this.trimImportantValues() }
    }
  },
  methods: {
    changeHttpToHttps (urlString) {
      if (!urlString) return

      const url = new URL(urlString)
      if (url.protocol === 'http:') {
        url.protocol = 'https:'
      }

      return url.toString()
    },
    processHttp () {
      this.importantFields.forEach(field => {
        this.form[field].apiUrl = this.changeHttpToHttps(this.form[field].apiUrl)
      })

      this.trimImportantValues()
    },
    domainsValidation () {
      const failedDomains = []
      const domainRegex = /^@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/

      // Filter all emails that don't match regex:
      this.form.emailDomains.forEach(domain => {
        const isIncorrect = !domainRegex.test(domain.trim())
        if (domain.trim() && isIncorrect) failedDomains.push(domain.trim())
      })

      this.incorrectDomains = failedDomains
      this.form.domainError = failedDomains.length > 0
    },
    generateSecret () {
      this.$confirm(this.$i18n.t('SW_ATTENTION_SECRET_GENERATE'), this.$i18n.t('SW_ATTENTION_SECRET_GENERATE_TITLE'), {
        confirmButtonText: this.$i18n.t('SW_GENERATE'),
        cancelButtonText: this.$i18n.t('SW_CANCEL')
      }).then(() => {
        this.processing = true

        this.$http.get('organizations/secret', { params: { organization: this.form._id } })
          .then((res) => {
            this.form.ltiBasic.secret = res.data.list[0]
            this.$message({ message: this.$i18n.t('SW_LTISECRET_GENERATED'), type: 'success' })
            this.generatedSecretAlert = true
          })
          .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
          .finally(() => { this.processing = false })
      })
    },
    trimImportantValues () {
      this.importantFields.forEach(formField => {
        for (const key in this.form[formField]) {
          if (this.form[formField] && typeof this.form[formField][key] === 'string') {
            this.form[formField][key] = this.form[formField][key].trim()
          }
        }
      })
    },
    showInput (type) {
      this.inputVisible[type] = true
      this.$nextTick((_) => { this.$refs[type].$refs.input.focus() })
    },
    handleInputConfirm (type) {
      const inputValue = this.inputValue[type].trim()
      if (inputValue) {
        if (type === 'samlEntityIds') this.form.saml.entityIds.push(inputValue.trim())
        else if (type === 'samlDomains') this.form.saml.domains.push(inputValue.trim())
        else this.form[type].push(inputValue.trim())
      }
      this.inputVisible[type] = false
      this.inputValue[type] = ''
    },
    handleClose (type, item) {
      if (type === 'samlEntityIds') this.form.saml.entityIds.splice(this.form.saml.entityIds.indexOf(item), 1)
      else if (type === 'samlDomains') this.form.saml.domains.splice(this.form.saml.domains.indexOf(item), 1)
      else this.form[type].splice(this.form[type].indexOf(item), 1)
      this.$nextTick()
    },
    clipboardSuccess () { this.$message({ message: this.$i18n.t('SW_COPIED_TO_CLIPBOARD'), type: 'success' }) }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
