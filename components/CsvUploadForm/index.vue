<template>
  <div>
    <p class="normal-line-height mb-10 font-13 text-muted" v-if="!existing && !users.length">{{ $t('SW_CSV_IMPORT_TEXT', [school.emailDomains.length ? `student-name${school.emailDomains[0]}` : 'student-name@school-name.com']) }}</p>

    <!-- Upload csv file -->
    <el-upload v-if="!users.length" class="inline" ref="csvUpload" action="" :show-file-list="false" :on-change="handleCSVChange"
               :on-exceed="handleUploadExceed" :auto-upload="false" :limit="1" :multiple="false" accept=".csv" :on-remove="handleRemoveCsv">
      <el-button size="medium" type="primary" :loading="submitting" plain>
        <i class="icon-upload"/>
        {{ $t('SW_UPLOAD_CSV_FILE') }}
      </el-button>
    </el-upload>

    <!-- Download template -->
    <el-button type="text" size="medium" class="ml-10 vertical-top" v-if="!submitting && !users.length" @click.prevent="downloadTemplate">
      <i class="icon-download"/>
      <span>{{ $t('SW_DOWNLOAD_TEMPLATE') }}</span>
    </el-button>

    <!-- Successful upload -->
    <el-alert v-if="users.length && !submitting" type="success" class="normal-line-height" show-icon :closable="false" :title="$t('SW_CSV_UPLOAD_SUCCESSFUL')">
      <div v-if="!noGroup">
        <p class="mb-10" v-if="!existing">{{ $t('SW_REUSE_EVAL_INFO', [users.length, groups.length]) }}</p>
        <p class="mb-10" v-else>{{ $t('SW_CSV_CHANGES_TEXT', [existing.groups, existing.students, groups.length, users.length]) }}</p>
      </div>
      <p class="mb-10" v-else-if="useParticipantsCsv && assessors">{{ $t('SW_REUSE_EVAL_INFO_ASSESSORS', [users.length]) }}</p>
      <p class="mb-10" v-else>{{ $t('SW_REUSE_EVAL_USER', [users.length]) }}</p>

      <!-- See student list -->
      <el-button size="small" type="success" v-if="!existing" @click="toggleStudentsList">
        <i class="icon-users"/>
        {{ $t(buttonText ? buttonText : 'SW_VIEW_STUDENTS') }}
      </el-button>

      <!-- Remove csv -->
      <el-button type="success" size="small" plain @click="handleRemoveCsv">
        <i class="icon-cancel"></i>
        <span v-if="!useParticipantsCsv">{{ $t('SW_UPLOAD_NEW_CSV') }}</span>
        <!-- Comproved specific code -->
        <span v-else-if="useParticipantsCsv && isGroups">{{ $t('SW_UPLOAD_NEW_CSV') }}</span>
        <span v-else>{{ $t(cancelButtonText ? cancelButtonText : 'SW_UPLOAD_NEW_CSV_PARTICIPANTS') }}</span>
      </el-button>
    </el-alert>

    <!-- Warn about invalid emails -->
    <div class="mt-10 normal-line-height" v-if="invalidUsers.length">
      <el-alert :title="$t('SW_CSV_INVALID_EMAIL_TITLE', [invalidUsers.length])" type="error" :closable="false" effect="dark" show-icon>
        {{ $t('SW_CSV_INVALID_EMAIL_TEXT') }}
        <p v-if="invalidDomain">{{ $t('SW_DOMAIN_ISSUE') }}</p>
      </el-alert>
      <!-- Invalid emails table -->
      <el-table :data="invalidUsers" style="width: 100%" size="small" max-height="300px" class="mt-10">
        <el-table-column prop="name" :label="$t('SW_NAME')" width="180"/>
        <el-table-column prop="email" :label="$tc('SW_EMAIL', 1)" width="300"/>
        <el-table-column v-if="!noGroup" prop="groupName" :label="$tc('SW_GROUP', 1)"/>
      </el-table>
    </div>

    <!-- Warn about duplicated emails -->
    <div class="mt-10 normal-line-height" v-if="invalidDuplicatedUsers.length">
      <el-alert :title="$t('SW_CSV_DUPLICATED_EMAIL_TITLE', [invalidDuplicatedUsers.length])" type="error" :closable="false" effect="dark" show-icon>
        {{ $t('SW_CSV_DUPLICATED_EMAIL_TEXT') }}
      </el-alert>
      <!-- Duplicated emails list -->
      <el-table :data="invalidDuplicatedUsers" style="width: 100%" size="small" max-height="300px" class="mt-10">
        <el-table-column prop="name" :label="$t('SW_NAME')" width="180"/>
        <el-table-column prop="email" :label="$tc('SW_EMAIL', 1)" width="300"/>
        <el-table-column v-if="!noGroup" prop="groupName" :label="$tc('SW_GROUP', 1)"/>
      </el-table>
    </div>

    <!-- students list table -->
    <el-dialog :visible.sync="usersListVisible" :title="$t(buttonText ? buttonText : 'SW_VIEW_STUDENTS')">
        <students-table v-if="usersListVisible" :tableData="users" :noGroup="noGroup" :participantTypeText="participantTypeText"/>
    </el-dialog>

  </div>
</template>

<script>
import config from 'config'
import Papa from 'papaparse'
import StudentsTable from '../StudentsTable'
import emailsValidation from '../../utils/emails-validation'

export default {
  name: 'CsvUploadForm',
  props: ['existing', 'noGroup', 'templatePrefix', 'buttonText', 'cancelButtonText', 'participantTypeText', 'isGroups', 'assessors'],
  components: { StudentsTable },

  data () {
    return {
      useParticipantsCsv: config.useParticipantsCsv,
      user: this.$store.state.user,
      course: this.$store.state.course || null,
      school: this.$store.state.school,
      lang: this.$store.state.lang,
      users: [],
      invalidUsers: [],
      invalidDuplicatedUsers: [],
      submitting: false,
      groups: false,
      invalidDomain: false,
      usersListVisible: false
    }
  },

  methods: {
    toggleStudentsList () { this.usersListVisible = !this.usersListVisible },
    handleRemoveCsv () {
      this.$emit('clearUsers')
      this.users = []
      this.invalidUsers = []
      this.invalidDuplicatedUsers = []
      this.submitting = false

      if (this.$refs?.csvUpload?.clearFiles) {
        this.$refs.csvUpload.clearFiles()
      }
    },
    handleCSVChange (file) {
      this.submitting = true
      this.users = []
      this.invalidUsers = []
      this.invalidDuplicatedUsers = []
      this.groups = []
      this.invalidDomain = false

      Papa.parse(file.raw, {
        download: true,
        encoding: 'ISO-8859-1',
        skipEmptyLines: true,
        header: true,
        transform: (value) => {
          let newValue

          try {
            // If the string is ISO, this will work and not throw an error.
            newValue = decodeURIComponent(escape(value))
          } catch {
            // If it isn't, an error will be thrown, and we can assume that we have an UTF8 string.
            newValue = value
          }
          // Trim all values
          return newValue.trim()
        },
        complete: (results) => {
          let filteredResults = []

          if (this.noGroup) {
            // Without group
            filteredResults = results.data.filter(user => {
              return user.name && user.email
            })
          } else {
            // With group
            filteredResults = results.data.filter(user => {
              return user.name && user.email && (user.groupName || user.group || user.groupname)
            })
          }

          // Clean up the results
          for (const user of filteredResults) {
            user.email = user.email.toLowerCase()
            user.name = user.name.replace(/\uFFFD/g, '')

            if (!this.noGroup) {
              const group = user.groupName || user.groupname || user.group
              user.groupName = group.replace(/[^\x00-\x7F]/g, '')
            }

            let validDomain = true

            if (this.school?.emailDomains?.length) {
              validDomain = this.school.emailDomains.find(domain => {
                const result = `@${user.email.split('@')[1]}`
                return result.includes(domain)
              })
            }

            // check is user unique
            if (this.useParticipantsCsv) {
              const isUnique = filteredResults.filter(u => u.email === user.email)

              if (isUnique.length > 1) {
                this.invalidDuplicatedUsers.push(user)
              }
            }

            if (!validDomain) {
              this.invalidUsers.push(user)
              this.invalidDomain = true
            } else {
              emailsValidation(user.email, this.invalidUsers, this.users, user, user)
            }

            // Create array of unique groups
            if (!this.groups.includes(user.groupName) && !this.noGroup) this.groups.push(user.groupName)
          }

          // If invalid users, stop and show the users and the problems
          if (this.invalidUsers.length || this.invalidDuplicatedUsers.length) {
            this.users = []
            this.submitting = false
            this.$emit('clearUsers')
            return this.$refs.csvUpload.clearFiles()
          }

          // If no users, stop and give error message {
          if (!this.users.length) {
            this.$message({ message: this.$i18n.t('SW_NO_USERS_FOUND_IN_CSV'), type: 'error' })
            return this.handleRemoveCsv()
          }

          this.$emit('addUsers', this.users)
          this.submitting = false
        }
      })
    },
    handleUploadExceed () {
      this.$message({ message: this.$i18n.t('SW_PLEASE_REMOVE_FIRST'), type: 'error' })
    },
    downloadTemplate () {
      window.open(this.templatePrefix + this.school.csvSeparator + '-separated.csv')
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
