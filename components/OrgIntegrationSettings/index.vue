<template>
  <div>
    <el-alert :title="$t('SW_INTEGRATIONS_INFO_TITLE', [appName])" class="mb-30" type="info" show-icon>
      <div>
        {{ $t('SW_INTEGRATIONS_INFO_TEXT', [appName]) }}

        <p class="mt-5 bold">
          {{ $t('SW_HELP_SETUP_INTEGRATION') }}
          <a v-if="showChatLink"  href="#" @click.prevent="openChat">{{ $t('SW_HAVE_A_CHAT').toLowerCase() }}</a>
          <a v-else  href="#" @click.prevent="openChat">{{ $t('SW_CONTACT_US').toLowerCase() }}</a>.
        </p>
      </div>
    </el-alert>

    <!-- Show credentials in UI -->
    <el-switch v-model="hideCredentials" active-color="#13ce66" inactive-color="#ff4949" class="mb-20" :active-text="$t('SW_VIEW_CREDENTIALS')"/>

    <!-- Incorrect email domains -->
    <el-alert class="mb-10" show-icon v-if="incorrectDomains.length" type="error" :title="$tc('SW_DOMAINS_NOT_CORRECT', incorrectDomains.length)">
      <ul>
        <li v-for="domain in incorrectDomains" :key="domain">
          <span class="bold">{{ domain }}</span>
        </li>
      </ul>
    </el-alert>

    <!-- Email domains -->
    <el-form-item :label="$t('SW_EMAIL_DOMAINS')" required>
      <el-tag v-for="domain in form.emailDomains" :key="domain" closable :disable-transitions="false" @close="handleClose('emailDomains', domain)">
        {{ domain }}
      </el-tag>

      <el-input size="small" ref="emailDomains" class="inline ml-5" v-if="inputVisible.emailDomains" v-model="inputValue.emailDomains"
                placeholder="@role.your-school.com" @keyup.enter.native="handleInputConfirm('emailDomains')"
                @blur="handleInputConfirm('emailDomains')"/>

      <!-- New domain -->
      <el-button v-else size="small" class="ml-5" @click="showInput('emailDomains')">
        <i class="icon-add"/>
        {{ $t('SW_NEW_DOMAIN') }}
      </el-button>
    </el-form-item>

    <!--Saml domains-->
    <el-form-item :label="$t('SW_SAML_DOMAINS')" required>
      <el-tag v-for="samlDomain in form.saml.domains" :key="samlDomain" closable :disable-transitions="false" @close="handleClose('samlDomains', samlDomain)">
        {{ samlDomain }}
      </el-tag>
      <el-input class="inline ml-5" size="small" v-if="inputVisible.samlDomains" v-model="inputValue.samlDomains"
              placeholder="saml-domain.edu" ref="samlDomains" @keyup.enter.native="handleInputConfirm('samlDomains')"
              @blur="handleInputConfirm('samlDomains')"/>

      <!-- New SAML domain -->
      <el-button v-else size="small" class="ml-5" @click="showInput('samlDomains')">
        <i class="icon-add"/>
        {{ $t('SW_NEW_SAML_DOMAIN') }}
      </el-button>
    </el-form-item>

    <!--Saml entity IDs-->
    <el-form-item :label="$t('SW_SAML_ENTITY_IDS')">
      <el-tag v-for="entity in form.saml.entityIds" :key="entity" closable :disable-transitions="false" @close="handleClose('samlEntityIds', entity)">
        {{ entity }}
      </el-tag>

      <el-input class="inline ml-5" size="small" v-if="inputVisible.samlEntityIds" v-model="inputValue.samlEntityIds"
                placeholder="https://www.saml-domain.edu/saml-login-url" ref="samlEntityIds" @keyup.enter.native="handleInputConfirm('samlEntityIds')"
                @blur="handleInputConfirm('samlEntityIds')"/>

      <el-button v-else size="small" class="ml-5" @click="showInput('samlEntityIds')">
        <i class="icon-add"/>
        {{ $t('SW_NEW_SAML_ENTITY_ID') }}
      </el-button>
    </el-form-item>

    <!-- LMS -->
    <el-form-item :label="$t('SW_LMS')">
      <el-radio-group v-model="form.lms" size="small">
        <el-radio-button v-for="lms in lmsTypes" :key="lms" class="capitalize" :label="lms"/>
      </el-radio-group>
    </el-form-item>

    <!-- LMS === none -> hide all -->
    <el-collapse-transition>
      <div v-show="form.lms !== 'none'">
        <!-- Set Lti version-->
        <el-form-item label="LTI version">
          <el-radio-group v-model="form.ltiVersion" size="small">
            <el-radio-button label="basic">LTI Basic (v1.1)</el-radio-button>
            <el-radio-button label="advantage">LTI Advantage (v1.3)</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <!-- Lti Basic configuration -->
        <transition name="opacity" mode="out-in">
          <div v-if="form.ltiVersion === 'basic'" class="mb-20" key="basic">
            <!-- LTI config url -->
            <el-form-item label="LTI config URL">
              <el-input v-model="ltiConfigUrl" :readonly="true" type="url">
                <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
                  <el-button v-clipboard="ltiConfigUrl" @success="clipboardSuccess">
                    <i class="icon-copy"/>
                  </el-button>
                </el-tooltip>
              </el-input>
            </el-form-item>

            <!-- LTI key -->
            <el-form-item label="LTI key">
              <el-input v-model="form._id" :readonly="true" type="text">
                <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
                  <el-button v-clipboard="form._id" @success="clipboardSuccess">
                    <i class="icon-copy"/>
                  </el-button>
                </el-tooltip>
              </el-input>
            </el-form-item>

            <!-- LTI secret -->
            <el-form-item label="LTI secret">
              <el-input v-model="form.lmsConfig.ltiBasicSecret" :readonly="true" :type="hideCredentials ? 'password' : 'text'" :placeholder="$t('SW_SECRET_PLACEHOLDER')">
                <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
                  <el-button v-clipboard="form.lmsConfig.ltiBasicSecret" @success="clipboardSuccess">
                    <i class="icon-copy"/>
                  </el-button>
                </el-tooltip>

                <el-tooltip slot="append" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_GENERATE_SECRET_TEXT')" placement="bottom-end">
                  <el-button @click="generateSecret">
                    <i class="icon-repeat"/>
                    {{ $t('SW_GENERATE') }}
                  </el-button>
                </el-tooltip>
              </el-input>

              <!-- Generated key alert -->
              <el-alert v-if="generatedSecretAlert" class="mt-10" show-icon center :title="$t('SW_GENERATED_KEY_ALERT')" type="warning" :closable="false"/>
            </el-form-item>
          </div>

          <!-- Lti Advantage configuration -->
          <div v-else-if="form.ltiVersion === 'advantage'" class="mb-20" key="advantage">
            <!-- LTI config domain -->
            <el-form-item label="LTI domain url">
              <el-input v-model="ltiAdvantageDomainUrl" :readonly="true" type="url">
                <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
                  <el-button v-clipboard="ltiAdvantageDomainUrl" @success="clipboardSuccess"><i class="icon-copy"/></el-button>
                </el-tooltip>
              </el-input>
            </el-form-item>

            <!-- LTI config Redirect Urls -->
            <el-form-item label="LTI redirect url">
              <el-input v-model="ltiAdvantageRedirectUrl" :readonly="true" type="url">
                <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
                  <el-button v-clipboard="ltiAdvantageRedirectUrl" @success="clipboardSuccess"><i class="icon-copy"/></el-button>
                </el-tooltip>
              </el-input>
            </el-form-item>
            <!-- LTI config Redirect Urls -->
            <el-form-item label="LTI login url">
              <el-input v-model="ltiAdvantageLoginUrl" :readonly="true" type="url">
                <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
                  <el-button v-clipboard="ltiAdvantageLoginUrl" @success="clipboardSuccess"><i class="icon-copy"/></el-button>
                </el-tooltip>
              </el-input>
            </el-form-item>
            <!-- LTI config Keyset Url -->
            <el-form-item label="LTI keyset url">
              <el-input v-model="ltiAdvantageKeysetUrl" :readonly="true" type="url">
                <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
                  <el-button v-clipboard="ltiAdvantageKeysetUrl" @success="clipboardSuccess"><i class="icon-copy"/></el-button>
                </el-tooltip>
              </el-input>
            </el-form-item>
            <!-- Lti Key id -->
            <el-form-item label="LTI key">
              <el-input v-model="form.lmsConfig.ltiAdvantageId" type="text" :placeholder="lmsTitle + ' LTI Advantage key ...'"/>
            </el-form-item>
            <!-- Lti-advantage app id -->
            <el-form-item label="LTI app id" v-if="form.lms === 'blackboard'">
              <el-input v-model="form.lmsConfig.ltiAdvantageAppId" type="text" :placeholder="lmsTitle + ' LTI Advantage App id ...'"/>
            </el-form-item>
            <!-- Lti-advantage deployment id -->
            <el-form-item label="LTI deployment id" v-if="['blackboard', 'brightspace'].includes(form.lms)">
              <el-input v-model="form.lmsConfig.ltiAdvantageDeploymentId" type="text" :placeholder="lmsTitle + ' LTI Advantage deployment id ...'"/>
            </el-form-item>
            <!-- Lti-advantage auth secret -->
            <el-form-item label="LTI secret">
              <el-input v-model="form.lmsConfig.ltiAdvantageSecret" :type="hideCredentials ? 'password' : 'text'" :placeholder="lmsTitle + ' LTI Advantage secret ...'"/>
            </el-form-item>
            <!-- Lti-advantage auth url -->
            <el-form-item label="LTI auth url">
              <el-input v-model="form.lmsConfig.ltiAdvantageAuthUrl" type="text" :placeholder="lmsTitle + ' LTI Advantage auth url ...'"/>
            </el-form-item>
            <!-- Ilearn only with Lti-advantage Deeplink-->
            <el-form-item label="Deeplinking" v-if="form.lms === 'ilearn'">
              <el-switch v-model="form.lmsConfig.ltiAdvantageDeeplinking" active-color="#13ce66" inactive-color="#ff4949"/>
              <span class="text-muted ml-10">{{ $t('SW_USE_DEEPLINK_TEXT' )}}</span>
            </el-form-item>
          </div>
        </transition>

        <!-- LTI Custom Tool parameters -->
        <el-form-item label="LTI tool parameters" v-if="parameters[form.lms] && parameters[form.lms][form.ltiVersion]">
          <p class="form-help-text">
            <span class="text-muted font-13">{{ $t('SW_PARAMETERS_EXPLAINER') }}</span>
          </p>
          <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" :readonly="true" v-model="parameters[form.lms][form.ltiVersion]"/>
        </el-form-item>

        <!-- Enable API Integration -->
        <el-form-item class="mb-10" :label="$t('SW_TOGGLE_API_INTEGRATION')">
          <el-switch v-model="form.lmsApiIntegration" active-color="#13ce66" inactive-color="#ff4949"/>
          <span class="text-muted ml-10">{{ $t('SW_TOGGLE_API_INTEGRATION_TEXT' )}}</span>
        </el-form-item>

        <!-- Api Integration fields -->
        <el-collapse-transition>
          <div v-show="form.lmsApiIntegration">
            <!-- Open new tab during oauth launch -->
            <el-form-item class="mb-10" :label="$t('SW_TOGGLE_OPEN_NEW_TAB')">
              <el-switch v-model="form.openNewLtiTab" active-color="#13ce66" inactive-color="#ff4949"/>
              <span class="text-muted ml-10">{{ $t('SW_TOGGLE_OPEN_NEW_TAB_TEXT' )}}</span>
            </el-form-item>

            <!-- Use popup for Oauth launch -->
            <el-form-item class="mb-10" :label="$t('SW_TOGGLE_OAUTH_POPUP')">
              <el-switch v-model="form.usePopupForOauth" active-color="#13ce66" inactive-color="#ff4949"/>
              <span class="text-muted ml-10">{{ $t('SW_TOGGLE_OAUTH_POPUP_TEXT' )}}</span>
            </el-form-item>

            <div v-for="lms in apiTemplates" :key="lms.name" v-show="lms.name === form.lms">
              <div v-if="lms.name !== 'moodle'">
                <!-- URL -->
                <el-form-item :label="lmsTitle + ' URL'" v-if="lms.apiUrl">
                  <el-input @change="processHttp" v-model="form.lmsConfig.apiUrl" type="url" :placeholder="lms.apiUrl.placeholder"/>
                </el-form-item>
                <!-- Callback url -->
                <el-form-item :label="lmsTitle + ' Callback URI'" v-if="!['blackboard', 'ilearn'].includes(lms.name)">
                  <el-input v-model="callbackUrl" :readonly="true" type="url">
                    <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
                      <el-button v-clipboard="callbackUrl" @success="clipboardSuccess"><i class="icon-copy"/></el-button>
                    </el-tooltip>
                  </el-input>
                </el-form-item>
                <!-- App ID -->
                <el-form-item label="Application ID" v-if="lms.appId">
                  <el-input v-model="form.lmsConfig.appId">
                    <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
                      <el-button v-clipboard="form.lmsConfig.appId"><i class="icon-copy"/></el-button>
                    </el-tooltip>
                  </el-input>
                </el-form-item>
                <!-- API key -->
                <el-form-item :label="lms.apiId.label" v-if="lms.apiId">
                  <el-input v-model="form.lmsConfig.apiId" type="text" :placeholder="lms.apiId.placeholder"/>
                </el-form-item>
                <!-- API Secret -->
                <el-form-item :label="lms.apiSecret.label" v-if="lms.apiSecret">
                  <el-input v-model="form.lmsConfig.apiSecret" :type="hideCredentials ? 'password' : 'text'" :placeholder="lms.apiSecret.placeholder"/>
                </el-form-item>
                <!-- API Scope -->
                <el-form-item :label="lms.apiScope.label" v-if="lms.apiScope">
                  <p class="form-help-text">
                    <span class="">{{ $t('SW_SCOPES_EXPLAINER') }}</span>
                    <strong class="ml-5" v-if="lms.name === 'canvas'">{{ $t('SW_SCOPES_EXPLAINER_CANVAS') }}</strong>
                    <el-button type="text" @click="generateScopes" class="ml-5" size="medium">
                      {{ $t('SW_GENERATE_DEFAULT_SCOPES') }}
                    </el-button>
                  </p>
                    <!-- Scopes -->
                    <div v-for="(scope, index) in form.lmsConfig.scope" :key="index">
                      <div class="mb-10">
                        <el-input v-model="form.lmsConfig.scope[index]">
                          <template slot="prepend">#{{index + 1}}</template>

                          <!-- Delete email -->
                          <el-popconfirm slot="append" :confirmButtonText="$t('SW_DELETE')" :cancelButtonText="$t('SW_CANCEL')"
                                         @confirm="removeScope(index)" hideIcon :title="$t('SW_DELETE_SCOPE_CONFIRM')">
                            <el-button slot="reference">
                              <i class="icon-delete"/>
                              <span class="hidden-xs">{{ $t('SW_REMOVE') }}</span>
                            </el-button>
                          </el-popconfirm>
                        </el-input>
                      </div>
                    </div>

                  <!-- Add scope -->
                  <el-button @click="addScope" class="block">
                    <i class="icon-add"/>
                    {{ $t('SW_ADD_SCOPE') }}
                  </el-button>
                </el-form-item>
              </div>
              <!-- No API integration -->
              <el-alert v-else :title="$t('SW_NO_API_INTEGRATION_YET')" class="mb-30" :description="$t('SW_NO_API_INTEGRATION_YET_TEXT')" type="warning" show-icon/>
            </div>
          </div>
        </el-collapse-transition>

      </div>
    </el-collapse-transition>
  </div>
</template>

<script>
import config from 'config'
import scopes from '@/edpack-web/lms-api-scopes.json'
import checkRegex from '@/edpack-web/utils/check-regex'
import parameters from '@/edpack-web/lti-custom-parameters.json'

export default {
  name: 'OrgIntegrationSettings',
  props: ['form'],

  data () {
    return {
      appName: config.name,
      school: this.$store.state.school,
      showChatLink: this.$store.state.school.enableFreshChat,
      incorrectDomains: [],
      generatedSecretAlert: false,
      processing: false,
      scopes: scopes,
      parameters: parameters,
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
      apiUrl: config.api_url,
      ltiConfigUrl: `${config.api_url}/lti`,
      ltiAdvantageDomainUrl: `${config.api_url.replace('/api/v1', '')}`,
      ltiAdvantageKeysetUrl: `${config.api_url}/lti/advantage/jwks`,

      lmsTypes: ['canvas', 'brightspace', 'blackboard', 'moodle', 'ilearn', 'none'],
      apiTemplates: [
        {
          name: 'canvas',
          apiUrl: { placeholder: 'ex. https://your-school.instructure.com ...' },
          apiId: { label: 'Canvas API key', placeholder: 'Canvas Developer Key ID ...' },
          apiSecret: { label: 'Canvas API secret', placeholder: 'Canvas Developer Key Secret ...' },
          apiScope: { label: 'Canvas API scope', placeholder: 'Canvas scope ...' }
        },
        {
          name: 'brightspace',
          apiUrl: { placeholder: 'ex. https://your-school.brightspace.com ...' },
          apiId: { label: 'Brightspace API ID', placeholder: 'Brightspace OAuth Client ID ...' },
          apiSecret: { label: 'Brightspace API secret', placeholder: 'Brightspace OAuth Client secret ...' },
          apiScope: { label: 'Brightspace API scope', placeholder: 'Brightspace scope ...' }
        },
        {
          name: 'blackboard',
          apiUrl: { placeholder: 'ex. https://your-school.blackboard.com ...' },
          appId: { label: 'Blackboard Application ID', placeholder: 'Blackboard Application ID ...' },
          apiId: { label: 'Blackboard App key', placeholder: 'Blackboard App Key ...' },
          apiSecret: { label: 'Blackboard App secret', placeholder: 'Blackboard App Secret ...' },
          apiScope: { label: 'Blackboard App scope', placeholder: 'Blackboard scope ...' }
        },
        {
          name: 'ilearn',
          apiUrl: { placeholder: 'ex. https://your-school.ilearn.com ...' },
          apiId: { label: 'iLearn App key', placeholder: 'iLearn App key ...' }
        }
      ]
    }
  },

  watch: {
    form: {
      deep: true,
      handler () {
        this.trimImportantValues()
      }
    }
  },

  computed: {
    callbackUrl () { return this.apiUrl + '/auth/' + this.form.lms + '/callback' },
    lmsTitle () { return this.form.lms.charAt(0).toUpperCase() + this.form.lms.substring(1) },
    ltiAdvantageRedirectUrl () { return `${config.api_url}/lti/advantage/` + this.form.lms + '/launch' },
    ltiAdvantageLoginUrl () { return `${config.api_url}/lti/advantage/` + this.form.lms + '/initiation' }
  },

  methods: {
    processHttp () {
      if (!this.form.lmsConfig.apiUrl) return

      const url = new URL(this.form.lmsConfig.apiUrl)
      // update protocol
      if (url.protocol === 'http:') url.protocol = 'https:'

      this.form.lmsConfig.apiUrl = url.toString()
    },
    domainsValidation () {
      const failedDomains = []

      // Filter all emails that don't match regex:
      this.form.emailDomains.forEach(domain => {
        const isIncorrect = !checkRegex(domain.trim(), 'domain')
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
            this.form.lmsConfig.ltiBasicSecret = res.data.list[0]
            this.$message({ message: this.$i18n.t('SW_LTISECRET_GENERATED'), type: 'success' })
            this.generatedSecretAlert = true
          })
          .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
          .finally(() => { this.processing = false })
      })
    },
    trimImportantValues () {
      for (const key in this.form.lmsConfig) {
        if (typeof this.form.lmsConfig[key] === 'string') {
          this.form.lmsConfig[key] = this.form.lmsConfig[key].trim()
        }
      }
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

      if (type === 'emailDomains') { this.domainsValidation() }
    },
    handleClose (type, item) {
      if (type === 'samlEntityIds') this.form.saml.entityIds.splice(this.form.saml.entityIds.indexOf(item), 1)
      else if (type === 'samlDomains') this.form.saml.domains.splice(this.form.saml.domains.indexOf(item), 1)
      else this.form[type].splice(this.form[type].indexOf(item), 1)
      this.$nextTick()

      if (type === 'emailDomains') { this.domainsValidation() }
    },
    generateScopes () {
      this.form.lmsConfig.scope = scopes[this.form.lms]
      this.$message({ message: this.$i18n.t('SW_SCOPES_GENERATED'), type: 'success' })
    },
    clipboardSuccess () { this.$message({ message: this.$i18n.t('SW_COPIED_TO_CLIPBOARD'), type: 'success' }) },
    addScope () {
      const length = this.form.lmsConfig.scope.length
      if (!length || this.form.lmsConfig.scope[length - 1]) {
        this.form.lmsConfig.scope.push('')
      }
    },
    removeScope (index) { this.form.lmsConfig.scope.splice(index, 1) },
    openContact () { this.$store.dispatch('setContactForm', true) },
    openChat () { window.fcWidget.open() },
  }
}
</script>
