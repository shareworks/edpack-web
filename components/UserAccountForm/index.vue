<template>
  <el-form ref="form" :model="form" label-width="150px">
    <!-- Thumbnail -->
    <el-form-item :label="$t('SW_YOUR_PHOTO')">
      <thumbnail-edit :form="form"></thumbnail-edit>
    </el-form-item>

    <!-- Full name -->
    <el-form-item :label="$t('SW_YOUR_NAME')" required>
      <el-input prefix-icon="icon-bio" v-model="form.name"></el-input>
    </el-form-item>

    <!-- Reset password -->
    <el-form-item :label="$t('SW_RESET_PASSWORD')" v-if="signinByPassword" class="additional reset-password">
      <el-button size="medium" type="primary" plain @click="showResetForm = true">
        <i class="icon-lock"></i>
        <span>{{ $t('SW_RESET') }}</span>
      </el-button>
    </el-form-item>

    <!-- Emails -->
    <el-form-item :label="$tc('SW_EMAIL', form.emails.length)" class="additional">
      <div v-for="(email, index) of form.emails" :key="index">
        <el-input prefix-icon="icon-email" v-model="form.emails[index]" :readonly="!isAdmin" @change="emailChanged = true" :placeholder="$t('SW_EMAIL_PLACEHOLDER')"
                  :class="email === form.email ? 'primary-email' : 'secondary-email'" class="mb-5" disabled>
          <!-- Change email is disabled, waiting for api  -->
          <el-button slot="append" @click="setPrimary(email)" v-if="isAdmin && form.emails.length > 1">
            <i v-if="email === form.email" class="el-icon-star-on el-icon-left"></i>
            {{email === form.email ? $t('SW_PRIMARY') : $t('SW_SECONDARY') }}
          </el-button>
        </el-input>
      </div>
      <el-button v-if="currentUser.systemAdmin" size="small" class="block" type="text" @click="form.emails.push('')">
        <i class="icon-add"></i>
        <span>{{ $t('SW_ADD_EMAIL') }}</span>
      </el-button>
    </el-form-item>

    <!-- Language -->
    <el-form-item :label="$t('SW_LANGUAGE')" class="additional" v-if="languages.length > 1">
      <el-select class="block" v-model="form.language">
        <el-option v-for="language in languages" :key="language" :label="$t('SW_DEFAULT_' + language.toUpperCase())" :value="language">
          <img :src="'/images/' + language + '.png'" class="language-icon" alt=""> &nbsp;
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
      {{ $tc('SW_' + (form.role || school.role).toUpperCase()) }}
      {{ $t('SW_ROLE_AT', { school: form.organization.name[lang] }) }}

      <el-dropdown v-if="isAdmin" trigger="click" @command="changeRole">
            <el-button size="small" class="ml-10">
              <i class="icon-pencil"></i>
              <span>{{ $t('SW_CHANGE_ROLE') }}</span>
            </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item :command="{ newRole: 'admin' }" :disabled="form.role === 'admin'">{{ $tc('SW_ADMIN', 1) }}</el-dropdown-item>
          <el-dropdown-item :command="{ newRole: 'staff' }" :disabled="form.role === 'staff'">{{ $tc('SW_STAFF', 1) }}</el-dropdown-item>
          <el-dropdown-item :command="{ newRole: 'student' }" :disabled="form.role === 'student'">{{ $tc('SW_STUDENT', 1) }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-form-item>

    <!-- Newsletter -->
    <el-form-item :label="$t('SW_NEWSLETTER')" class="additional">
      <el-checkbox class="newsletter" :label="$t('SW_NEWSLETTER_TEXT')" v-model="form.newsletter"></el-checkbox>
    </el-form-item>

    <!-- Submit or cancel -->
    <el-form-item>
      <el-button type="primary" class="mr-5" @click="onSubmit" :loading="submitting">
        {{ $t('SW_SAVE_CHANGES') }}
      </el-button>
      <el-button type="text" @click="finish()">{{ $t('SW_CANCEL') }}</el-button>
    </el-form-item>

    <el-dialog :title="$t('SW_RESET_PASSWORD')" :visible.sync="showResetForm">
      <p class="mb-20">{{ $t('SW_RESET_PASSWORD_TEXT') }}</p>
      <reset-form :hide-shadow="true"></reset-form>
    </el-dialog>
  </el-form>
</template>

<script>
import ResetForm from '../ResetForm'
import config from 'config'
import { loadLanguages } from '../../utils/load-languages'
import ThumbnailEdit from '../../components/ThumbnailEdit'

export default {
  name: 'UserAccountForm',
  props: ['form', 'finish', 'updateUser'],
  components: { ThumbnailEdit, ResetForm },

  data () {
    return {
      currentUser: this.$store.state.user,
      lang: this.$store.state.lang,
      school: this.$store.state.school,
      isAdmin: this.$store.state.isAdmin,
      submitting: false,
      signinByPassword: config.signinByPassword,
      languages: this.$store.state.languages,
      emailChanged: false,
      changingRole: false,
      showResetForm: false
    }
  },

  methods: {
    setPrimary (email) {
      this.form.email = email
      this.emailChanged = true
    },
    onSubmit () {
      this.submitting = true
      const params = { params: { entity: this.school._id } }
      if (this.emailChanged) params.params.updateEmails = true

      this.$http.put(`users/${this.form._id}`, this.form, params)
        .then((res) => {
          const user = this.$store.state.user
          const updatedUser = res.data.list[0]

          if (this.updateUser) {
            this.updateUser(updatedUser._id, this.form)
          }

          this.$message({ message: this.$i18n.t('SW_CHANGES_SAVED'), type: 'success' })

          if (this.form._id === this.currentUser._id) {
            // Update current user
            updatedUser.organization = user.organization
            updatedUser.organizations = user.organizations
            loadLanguages(this.$i18n, this.form.language)
            this.$store.dispatch('setUser', updatedUser)
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

      this.changingRole = this.form._id

      const student = [{
        recipientEmail: this.form.email,
        downGrade: true,
        contextId: this.school._id,
        role: newRole
      }]

      this.$http.post('users/invite', { invitations: student })
        .then((res) => {
          if (this.updateUser) {
            this.updateUser(...res.data.list, { role: newRole })
          }

          this.form.role = newRole
          this.$message({ message: this.$i18n.t('SW_ROLE_CHANGED'), type: 'success' })
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.changingRole = false })
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
