<template>
  <el-form ref="form" :model="form" label-width="150px">
    <!-- Thumbnail -->
    <el-form-item :label="$t('SW_YOUR_PHOTO')">
      <thumbnail-edit :form="form"/>
    </el-form-item>

    <!-- Full name -->
    <el-form-item :label="$t('SW_YOUR_NAME')" required>
      <el-input prefix-icon="icon-bio" v-model="form.name"/>
    </el-form-item>

    <!-- Reset password -->
    <el-form-item :label="$t('SW_RESET_PASSWORD')" v-if="school.loginByPassword" class="additional reset-password">
      <el-button size="medium" type="primary" plain @click="resetPasswordEmail" :loading="resetting">
        <i class="icon-lock"/>
        <span>{{ $t('SW_RESET') }}</span>
      </el-button>
    </el-form-item>

    <!-- Emails -->
    <el-form-item :label="$tc('SW_EMAIL', form.emails.length)" class="additional">
      <div v-for="(email, index) of form.emails" :key="index">
        <el-input prefix-icon="icon-email" v-model="form.emails[index]" :readonly="emailsCopy.includes(email)" @change="emailChanged = true" :placeholder="$t('SW_EMAIL_PLACEHOLDER')"
                  :class="email === form.email ? 'primary-email' : 'secondary-email'" class="mb-5">

          <!-- Delete email -->
          <el-popconfirm v-if="form.emails.length > 1" slot="append" :confirmButtonText="$t('SW_DELETE')" :cancelButtonText="$t('SW_CANCEL')"
                         @confirm="deleteEmail(email)" hideIcon :title="$t('SW_DELETE_EMAIL_CONFIRM')">
            <el-button slot="reference" class="delete-email-button mr-5">
              <i class="icon-delete"/>
              <span v-if="!isMobile">{{ $t('SW_REMOVE') }}</span>
            </el-button>
          </el-popconfirm>

          <!-- Make primary -->
          <el-button class="primary-button-toggle" slot="append" @click="setPrimary(email)" v-if="isAdmin && form.emails.length > 1">
            <i v-if="email === form.email" class="el-icon-star-on el-icon-left"/>
            {{email === form.email ? $t('SW_PRIMARY') : $t('SW_SECONDARY') }}
          </el-button>
        </el-input>
      </div>

      <!-- Add email -->
      <el-button v-if="user.systemAdmin" size="small" class="block" type="text" @click="form.emails.push('')">
        <i class="icon-add"/>
        <span>{{ $t('SW_ADD_EMAIL') }}</span>
      </el-button>
    </el-form-item>

    <!-- Language -->
    <el-form-item :label="$t('SW_LANGUAGE')" class="additional" v-if="languages.length > 1">
      <el-select class="block" v-model="form.language">
        <el-option v-for="language in languages" :key="language" :label="$t('SW_DEFAULT_' + language.toUpperCase())" :value="language">
          <img :src="'/img/' + language + '.png'" class="language-icon" alt="language-icon"> &nbsp;
          <span>{{ $t('SW_DEFAULT_' + language.toUpperCase()) }}</span>
        </el-option>
      </el-select>
    </el-form-item>

    <!--    @TODO: Change single faculty to faculties array-->
    <!--    &lt;!&ndash; Faculty &ndash;&gt;-->
    <!--    <el-form-item :label="school.terminology.faculty[lang]" v-if="school.manualCourses && school.faculties.length">-->
    <!--      <el-select class="block" v-model="form.faculty" value-key="_id" :placeholder="$t('SW_CHOOSE_FACULTY', [school.terminology.faculty[lang].toLowerCase()])">-->
    <!--        <el-option v-for="faculty in school.faculties" :key="faculty._id" :label="faculty[lang]" :value="faculty._id"></el-option>-->
    <!--      </el-select>-->
    <!--    </el-form-item>-->

    <!-- Role: Admin, Staff or Student -->
    <el-form-item :label="$tc('SW_ROLE', 1)" class="additional">
      <strong v-if="form.role === 'student' || user.role === 'student'">{{ school.terminology.student[lang] }}</strong>
      <strong v-else-if="form.role === 'staff' || user.role === 'staff'">{{ school.terminology.instructor[lang] }}</strong>
      <strong v-else-if="form.role === 'admin' || user.role === 'admin'">{{ $tc('SW_ADMIN', 1) }}</strong>

      {{ $t('SW_ROLE_AT', { school: form.organization.name[lang] }) }}

      <!-- Change role -->
      <el-dropdown v-if="isAdmin" trigger="click" @command="changeRole" :disabled="changingRole">
        <el-button size="small" class="ml-10" :loading="changingRole">
          <i class="icon-pencil"/>
          <span>{{ $t('SW_CHANGE_ROLE') }}</span>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item :command="{ newRole: 'admin' }" v-if="isSysAdmin" :disabled="form.role === 'admin'">{{ $tc('SW_ADMIN', 1) }}</el-dropdown-item>
          <el-dropdown-item :command="{ newRole: 'staff' }" :disabled="form.role === 'staff'">{{ school.terminology.instructor[lang] }}</el-dropdown-item>
          <el-dropdown-item :command="{ newRole: 'student' }" :disabled="form.role === 'student'">{{ school.terminology.student[lang] }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-form-item>

    <!-- Faculty manager -->
    <el-form-item v-if="school.enableFacultyManagers" :label="$t('SW_FACULTY_MANAGER')" class="additional" :loading="changingRole">
      <p v-if="isAdmin" class="form-help-text">{{ $t('SW_FACULTY_MANAGER_TEXT', [school.terminology.faculty[lang].toLowerCase()]) }}</p>
      <el-select class="block" v-model="facultyManager" multiple :disabled="!isAdmin || changingRole" @change="changeFacultyRole" :placeholder="$t('SW_FACULTY_MANAGER_PLACEHOLDER', [school.terminology.faculty[lang].toLowerCase()])" size="large">
        <el-option v-for="faculty in faculties" :key="faculty._id" :label="faculty[lang]" :value="faculty._id"/>
      </el-select>
    </el-form-item>

    <!-- High contrast mode -->
    <el-form-item :label="$t('SW_CONTRAST_MODE')">
      <el-switch v-model="form.contrastMode" active-color="#13ce66" inactive-color="#ff4949"/>
      <span class="ml-10">{{ $t('SW_CONTRAST_MODE_TEXT') }}</span>
    </el-form-item>

    <!-- Notifications switchers -->
    <el-form-item v-if="showFullAccountInfo && notificationRoles.length" :label="$t('SW_NOTIFICATIONS')">
      <el-collapse-transition>
        <notifications-switchers v-show="showNotifications" :form="form"/>
      </el-collapse-transition>

      <!-- Show or hide notifications -->
      <el-button type="text" size="normal" @click="showNotifications = !showNotifications">
        <span v-if="!showNotifications">{{  $t('SW_EDIT_NOTIFICATIONS') }}</span>
        <span v-else>{{ $t('SW_HIDE_NOTIFICATIONS') }}</span>
        <i :class="{'el-icon-caret-bottom': !showNotifications, 'el-icon-caret-top': showNotifications}" class="el-icon--right"/>
      </el-button>
    </el-form-item>

    <!-- Newsletter -->
    <el-form-item :label="$t('SW_NEWSLETTER')" class="additional">
      <el-checkbox class="newsletter" :label="$t('SW_NEWSLETTER_TEXT')" v-model="form.newsletter"/>
    </el-form-item>

    <!-- Submit or cancel -->
    <el-form-item>
      <el-button type="primary" class="mr-5" @click="onSubmit" :loading="submitting">
        {{ $t('SW_SAVE_CHANGES') }}
      </el-button>
      <el-button type="text" @click="finish()">{{ $t('SW_CANCEL') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { loadLanguages } from '../../utils/load-languages'
import ThumbnailEdit from '../../components/ThumbnailEdit'
import NotificationsSwitchers from '../NotificationsSwitchers'
import config from 'config'
import isEqual from 'lodash/isEqual'

export default {
  name: 'UserAccountForm',
  props: ['form', 'finish', 'updateUser', 'showFullAccountInfo'],
  components: { ThumbnailEdit, NotificationsSwitchers },

  data () {
    return {
      user: this.$store.state.user,
      lang: this.$store.state.lang,
      school: this.$store.state.school,
      isAdmin: this.$store.state.isAdmin,
      isSysAdmin: this.$store.state.user.systemAdmin,
      isMobile: this.$store.state.isMobile,
      submitting: false,
      faculties: this.$store.state.school.faculties,
      emailsCopy: [...this.form.emails],
      languages: this.$store.state.languages,
      emailChanged: false,
      changingRole: false,
      resetting: false,
      facultyManager: [],
      showNotifications: false,
      notificationRoles: config.notificationRoles || []
    }
  },

  created () {
    if (this.form.faculties) for (const faculty of this.form.faculties) this.facultyManager.push(faculty._id)
  },

  watch: {
    form: {
      deep: true,
      handler () {
        if (!this.showFullAccountInfo) return
        const unsavedChanges = !isEqual(this.user, this.form)
        this.$store.dispatch('setUnsavedChanges', unsavedChanges)
      }
    },
    'form.emails' () { this.checkDuplicatedEmails() }
  },

  methods: {
    deleteEmail (email) {
      // make another email primary
      if (this.form.email === email) {
        this.form.email = this.form.emails[0]
      }

      this.form.emails = this.form.emails.filter(em => em !== email)
      this.emailChanged = true
    },
    checkDuplicatedEmails () {
      const emailsCounter = {}

      // count emails
      this.form.emails.forEach(email => {
        if (email) { emailsCounter[email] = (emailsCounter[email] || 0) + 1 }
      })

      // check duplicated emails
      let hasDuplicatedEmails = false
      for (const emailsCountKey in emailsCounter) {
        if (emailsCounter[emailsCountKey] > 1) hasDuplicatedEmails = true
      }

      if (!hasDuplicatedEmails) return

      // filter emails and add one new empty input
      this.form.emails = this.form.emails.filter(email => {
        if (emailsCounter[email] > 1) {
          emailsCounter[email]--
          return false
        }
        return true
      })

      this.form.emails.push('')
    },
    setPrimary (email) {
      this.form.email = email
      this.emailChanged = true
    },
    onSubmit () {
      if (!this.form.name.trim()) {
        return this.$message({ message: this.$i18n.t('SW_FULL_NAME_REQUIRED'), type: 'warning' })
      }

      this.submitting = true
      const params = { params: { entity: this.school._id } }
      if (this.emailChanged) params.params.updateEmails = true

      this.$http.put(`users/${this.form._id}`, this.form, params)
        .then((res) => {
          const user = this.$store.state.user
          const updatedUser = res.data.list[0]

          this.$message({ message: this.$i18n.t('SW_CHANGES_SAVED'), type: 'success' })

          if (this.form._id === this.user._id) {
            // Update current user
            updatedUser.organization = user.organization
            updatedUser.organizations = user.organizations
            loadLanguages(this.$i18n, this.form.language)
            this.$store.dispatch('setUser', updatedUser)
          }

          if (this.updateUser) {
            this.updateUser(updatedUser._id, this.form)
          }

          this.finish(user)
        })
        .catch(() => { this.$message({ message: this.$i18n.t('SW_CHECK_FORM_AGAIN'), type: 'error' }) })
        .finally(() => { this.submitting = false })
    },
    changeRole (options) {
      const newRole = options.newRole

      if (this.changingRole) return
      if (!newRole) return

      this.changingRole = true

      const student = [{
        recipientEmail: this.form.email,
        downgrade: true,
        contextId: this.school._id,
        role: newRole
      }]

      this.$http.post('users/invite', { invitations: student })
        .then((res) => {
          if (this.updateUser) {
            this.updateUser(res.data.list[0], { ...this.user, role: newRole })
          }

          this.form.role = newRole
          this.$message({ message: this.$i18n.t('SW_ROLE_CHANGED'), type: 'success' })
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.changingRole = false })
    },
    changeFacultyRole (faculties) {
      const map = {}
      const result = []
      for (const faculty of faculties) map[faculty] = 1

      if (this.changingRole) return
      this.changingRole = true

      const invitations = []
      for (const faculty of this.faculties) {
        invitations.push({
          recipientEmail: this.form.email,
          downgrade: true,
          contextId: faculty._id,
          role: map[faculty._id] ? 'manager' : 'none'
        })

        if (map[faculty._id]) result.push({ ...faculty, role: 'manager' })
      }
      this.$http.post('users/invite', { invitations: invitations })
        .then((res) => {
          if (this.updateUser) this.updateUser(res.data.list[0], { ...this.user, faculties: result })
          this.form.faculties = result
          this.$message({ message: this.$i18n.t('SW_ROLE_CHANGED'), type: 'success' })
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.changingRole = false })
    },
    resetPasswordEmail () {
      if (this.resetting) return
      this.resetting = true

      this.$http.post('/auth/local/recover-password', { email: this.form.email })
        .then(() => {
          this.success = true
          this.$message({ message: this.$i18n.t('SW_EMAIL_RESET_SUBMITTED'), type: 'success' })
        })
        .catch((err) => {
          const message = err?.data?.errors && err?.data?.errors[0]?.translation ? this.$i18n.t('SW_' + err.data.errors[0].translation) : this.$i18n.t('SW_GENERIC_ERROR')
          this.$message({ message, type: 'error' })
        })
        .finally(() => { this.resetting = false })
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
