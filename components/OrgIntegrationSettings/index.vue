<template>
  <div>
    <el-alert :title="$t('SW_INTEGRATIONS_INFO_TITLE')" class="mb-30" :description="$t('SW_INTEGRATIONS_INFO_TEXT')" type="info" show-icon></el-alert>

    <!-- Show credentials in UI -->
    <el-switch v-model="hideCredentials" active-color="#13ce66" inactive-color="#ff4949" class="mb-20" :active-text="$t('SW_VIEW_CREDENTIALS')"></el-switch>

    <!--Email domains-->

    <el-alert class="mb-10" show-icon v-if="incorrectDomains.length !== 0" type="error" :title="$tc('SW_DOMAINS_NOT_CORRECT', incorrectDomains.length)">
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
        class="inline ml-5"
        size="small"
        v-if="inputVisible.emailDomains"
        v-model="inputValue.emailDomains"
        placeholder="@role.your-school.com"
        ref="emailDomains"
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
      <el-tag v-for="samlDomain in form.saml.domains" :key="samlDomain" closable :disable-transitions="false" @close="handleClose('samlDomains', domain)">
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
      <el-radio-group v-model="ltiVersion" size="small">
        <el-radio-button label="basic">LTI Basic (v1.1)</el-radio-button>
        <el-radio-button label="advantage">LTI Advantage (v1.3)</el-radio-button>
      </el-radio-group>
    </el-form-item>

    <!-- Lti Basic configuration -->
    <div v-if="ltiVersion === 'basic'" class="mb-20">
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
      </el-form-item>
    </div>

    <!-- Lti Advantage configuration -->
    <div v-if="ltiVersion === 'advantage'" class="mb-20">
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
            <el-radio-button label="canvas">Canvas</el-radio-button>
            <el-radio-button label="brightspace">Brightspace</el-radio-button>
            <el-radio-button label="blackboard">Blackboard</el-radio-button>
            <el-radio-button label="moodle">Moodle</el-radio-button>
            <el-radio-button label="ilearn">Ilearn</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <div v-if="form.lastConfiguredLms === 'canvas'">
          <!-- Canvas URL -->
          <el-form-item label="Canvas URL">
            <el-input v-model="form.canvas.apiUrl" type="url" placeholder="ex. https://your-school.instructure.com ..."></el-input>
          </el-form-item>

          <!-- Canvas callback url -->
          <el-form-item label="Canvas Callback URI">
            <el-input v-model="canvasCallbackUrl" :readonly="true" type="url">
              <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
                <el-button v-clipboard="canvasCallbackUrl" @success="clipboardSuccess">
                  <i class="icon-copy"></i>
                </el-button>
              </el-tooltip>
            </el-input>
          </el-form-item>

          <!-- Canvas key -->
          <el-form-item label="Canvas Key ID" v-if="ltiVersion === 'basic'">
            <el-input v-model="form.canvas.apiId" type="text" placeholder="Canvas Developer Key ID ..."></el-input>
          </el-form-item>

          <!-- Canvas secret -->
          <el-form-item label="Canvas Key Secret" v-if="ltiVersion === 'basic'">
            <el-input v-model="form.canvas.apiSecret" :type="hideCredentials ? 'password' : 'text'" placeholder="Canvas Developer Key Secret ..."></el-input>
          </el-form-item>

          <!-- Canvas Lti-advantage auth url -->
          <el-form-item label="Canvas LTI v1.3 Key ID" v-if="ltiVersion === 'advantage'">
            <el-input v-model="form.canvas.advantageApiId" :type="'text'" placeholder="Canvas LTI v1.3 Key ID ..."></el-input>
          </el-form-item>

          <!-- Canvas Lti-advantage auth secret -->
          <el-form-item label="Canvas LTI v1.3 Key Secret" v-if="ltiVersion === 'advantage'">
            <el-input v-model="form.canvas.advantageApiSecret" :type="'text'" placeholder="Canvas LTI v1.3 Key Secret ..."></el-input>
          </el-form-item>

          <!-- Canvas Lti-advantage auth url -->
          <el-form-item label="Canvas LTI v1.3 auth" v-if="ltiVersion === 'advantage'">
            <el-input v-model="form.canvas.advantageAuthUrl" :type="'text'" placeholder="Canvas LTI v1.3 authorization url ..."></el-input>
          </el-form-item>
        </div>

        <div v-else-if="form.lastConfiguredLms === 'brightspace'">
          <!-- Brightspace URL -->
          <el-form-item label="Brightspace URL">
            <el-input v-model="form.brightspace.apiUrl" type="url" placeholder="ex. https://your-school.brightspace.com ..."></el-input>
          </el-form-item>

          <!-- Brightspace callback url -->
          <el-form-item label="Brightspace redirect URI">
            <el-input v-model="brightspaceCallbackUrl" :readonly="true" type="url">
              <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
                <el-button v-clipboard="brightspaceCallbackUrl" @success="clipboardSuccess">
                  <i class="icon-copy"></i>
                </el-button>
              </el-tooltip>
            </el-input>
          </el-form-item>

          <!-- Brightspace key -->
          <el-form-item label="Brightspace API client ID" v-if="ltiVersion === 'basic'">
            <el-input v-model="form.brightspace.apiId" type="text" placeholder="Brightspace OAuth Client ID ..."></el-input>
          </el-form-item>

          <!-- Brightspace secret -->
          <el-form-item label="Brightspace API client secret" v-if="ltiVersion === 'basic'">
            <el-input v-model="form.brightspace.apiSecret" :type="hideCredentials ? 'password' : 'text'" placeholder="Brightspace OAuth Client Secret ..."></el-input>
          </el-form-item>

          <!-- Brightspace Lti-advantage auth url -->
          <el-form-item label="Brightspace LTI v1.3 client id" v-if="ltiVersion === 'advantage'">
            <el-input v-model="form.brightspace.advantageApiId" :type="'text'" placeholder="Brightspace LTI v1.3 client id ..."></el-input>
          </el-form-item>

          <!-- Brightspace Lti-advantage auth secret -->
          <el-form-item label="Brightspace LTI v1.3 client secret" v-if="ltiVersion === 'advantage'">
            <el-input v-model="form.brightspace.advantageApiSecret" :type="'text'" placeholder="Brightspace LTI v1.3 client secret ..."></el-input>
          </el-form-item>

          <!-- Brightspace Lti-advantage auth url -->
          <el-form-item label="Brightspace LTI v1.3 auth" v-if="ltiVersion === 'advantage'">
            <el-input v-model="form.brightspace.advantageAuthUrl" :type="'text'" placeholder="Brightspace LTI v1.3 authorization url ..."></el-input>
          </el-form-item>
        </div>

        <div v-else-if="form.lastConfiguredLms === 'blackboard'">
          <!-- Blackboard URL -->
          <el-form-item label="Blackboard URL">
            <el-input v-model="form.blackboard.apiUrl" type="url" placeholder="ex. https://your-school.blackboard.com ..."></el-input>
          </el-form-item>

          <!-- Blackboard App ID -->
          <el-form-item label="Application ID">
            <el-input v-model="blackboardAppId" :readonly="true">
              <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
                <el-button v-clipboard="blackboardAppId">
                  <i class="icon-copy"></i>
                </el-button>
              </el-tooltip>
            </el-input>
          </el-form-item>

          <!-- Blackboard callback url -->
          <el-form-item label="Blackboard redirect URI" class="hide">
            <el-input v-model="blackboardCallbackUrl" :readonly="true" type="url">
              <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
                <el-button v-clipboard="blackboardCallbackUrl" @success="clipboardSuccess">
                  <i class="icon-copy"></i>
                </el-button>
              </el-tooltip>
            </el-input>
          </el-form-item>

          <!-- Blackboard key -->
          <el-form-item label="Blackboard App key">
            <el-input v-model="form.blackboard.apiId" type="text" placeholder="Blackboard App key ..."></el-input>
          </el-form-item>

          <!-- Blackboard secret -->
          <el-form-item label="Blackboard App secret">
            <el-input v-model="form.blackboard.apiSecret" :type="hideCredentials ? 'password' : 'text'" placeholder="Blackboard App Secret ..."></el-input>
          </el-form-item>
        </div>

        <div v-else-if="form.lastConfiguredLms === 'ilearn'">
          <!-- Ilearn URL -->
          <el-form-item label="ilearn URL">
            <el-input v-model="form.ilearn.apiUrl" type="url" placeholder="ex. https://your-school.ilearn.com ..."></el-input>
          </el-form-item>

          <!-- Ilearn App ID -->
          <el-form-item label="Application ID">
            <el-input v-model="iLearn" :readonly="true">
              <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
                <el-button v-clipboard="iLearn">
                  <i class="icon-copy"></i>
                </el-button>
              </el-tooltip>
            </el-input>
          </el-form-item>

          <!-- Ilearn callback url -->
          <el-form-item label="iLearn redirect URI" class="hide">
            <el-input v-model="iLearnCallbackUrl" :readonly="true" type="url">
              <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
                <el-button v-clipboard="iLearnCallbackUrl" @success="clipboardSuccess">
                  <i class="icon-copy"></i>
                </el-button>
              </el-tooltip>
            </el-input>
          </el-form-item>

          <!-- Ilearn key -->
          <el-form-item label="iLearn App key">
            <el-input v-model="form.ilearn.apiId" type="text" placeholder="iLearn App key ..."></el-input>
          </el-form-item>

          <!-- Ilearn secret -->
          <el-form-item label="iLearn App secret">
            <el-input v-model="form.ilearn.apiSecret" :type="hideCredentials ? 'password' : 'text'" placeholder="iLearn App Secret ..."></el-input>
          </el-form-item>
        </div>

        <el-alert v-else :title="$t('SW_NO_API_INTEGRATION_YET')" class="mb-30" :description="$t('SW_NO_API_INTEGRATION_YET_TEXT')" type="warning" show-icon>
        </el-alert>
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
      school: this.$store.state.school,
      user: this.$store.state.user,
      lang: this.$store.state.lang,
      ltiVersion: 'basic',
      incorrectDomains: [],
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
      iLearn: config.iLearn
    }
  },

  methods: {
    domainsValidation () {
      let failedDomains = []
      const domainRegex = /^@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/

      // Filter all emails that don't match regex:
      this.form.emailDomains.forEach(domain => {
        const isIncorrect = !domainRegex.test(domain)
        if (isIncorrect) { failedDomains.push(domain) }
      })

      failedDomains = failedDomains.filter(domain => { return domain.trim() !== '' })
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
          })
          .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
          .finally(() => { this.processing = false })
      })
    },
    showInput (type) {
      this.inputVisible[type] = true
      this.$nextTick((_) => { this.$refs[type].$refs.input.focus() })
    },
    handleInputConfirm (type) {
      const inputValue = this.inputValue[type]
      if (inputValue) {
        if (type === 'samlEntityIds') this.form.saml.entityIds.push(inputValue)
        else if (type === 'samlDomains') this.form.saml.domains.push(inputValue)
        else this.form[type].push(inputValue)
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
    clipboardSuccess () {
      this.$message({ message: this.$i18n.t('SW_COPIED_TO_CLIPBOARD'), type: 'success' })
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
