<template>
  <div>
    <p class="normal-line-height mb-10 font-13 text-muted" v-if="!existing && !users.length">{{ $t('SW_CSV_IMPORT_TEXT') }}</p>

    <!-- Upload csv file -->
    <el-upload v-if="!users.length" class="inline" ref="csvUpload" action="" :show-file-list="false" :on-change="handleCSVChange"
               :on-exceed="handleUploadExceed" :auto-upload="false" :limit="1" :multiple="false" accept=".csv" :on-remove="handleRemoveCsv">
      <el-button size="medium" type="primary" :loading="submitting" plain>
        <i class="icon-upload"></i>
        {{ $t('SW_UPLOAD_CSV_FILE') }}
      </el-button>
    </el-upload>

    <!-- Download template -->
    <el-button type="text" size="medium" class="ml-10 vertical-top" v-if="!submitting && !users.length" @click="downloadTemplate">
      <i class="icon-download"></i>
      <span>{{ $t('SW_DOWNLOAD_TEMPLATE') }}</span>
    </el-button>

    <!-- Successful upload -->
    <el-alert v-if="users.length && !submitting" type="success" class="normal-line-height" show-icon :closable="false" :title="$t('SW_CSV_UPLOAD_SUCCESSFUL')">
      <p class="mb-10" v-if="!existing">{{ $t('SW_REUSE_EVAL_INFO', [users.length, groups.length]) }}</p>
      <p class="mb-10" v-else>{{ $t('SW_CSV_CHANGES_TEXT', [existing.groups, existing.students, groups.length, users.length]) }}</p>
      <el-button size="small" type="success" v-if="!existing" @click="toggleStudentsList">
        <i class="icon-users"></i>
        {{ $t('SW_VIEW_STUDENTS') }}
      </el-button>
      <el-button type="success" size="small" plain @click="handleRemoveCsv">
        <i class="icon-cancel"></i>
        {{ $t('SW_UPLOAD_NEW_CSV') }}
      </el-button>
    </el-alert>

    <!-- Warn about invalid emails -->
    <div class="mt-10 normal-line-height" v-if="invalidUsers.length">
      <el-alert :title="$t('SW_CSV_INVALID_EMAIL_TITLE', [invalidUsers.length])" type="error" :closable="false" effect="dark" show-icon>
        {{ $t('SW_CSV_INVALID_EMAIL_TEXT') }}
      </el-alert>
      <el-table :data="invalidUsers" style="width: 100%" size="small" max-height="300px" class="mt-10">
        <el-table-column prop="name" :label="$t('SW_NAME')" width="180"></el-table-column>
        <el-table-column prop="email" :label="$t('SW_EMAIL')" width="300"></el-table-column>
        <el-table-column prop="groupName" :label="$t('SW_GROUP')"></el-table-column>
      </el-table>
    </div>

    <!-- students list table -->
    <el-dialog :visible.sync="usersListVisible">
        <students-table :tableData="users" />
    </el-dialog>

  </div>
</template>

<script>
import Papa from 'papaparse'
import StudentsTable from '../StudentsTable'

export default {
  name: 'CsvUploadForm',
  props: ['existing'],
  components: { StudentsTable },

  data () {
    return {
      user: this.$store.state.user,
      course: this.$store.state.course || null,
      lang: this.$store.state.lang,
      users: [],
      invalidUsers: [],
      submitting: false,
      groups: false,
      usersListVisible: false
    }
  },

  methods: {
    toggleStudentsList () {
      this.usersListVisible = !this.usersListVisible
    },
    handleRemoveCsv () {
      this.$emit('clearUsers')
      this.users = []
      this.invalidUsers = []
    },
    handleCSVChange (file) {
      const regexValidEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      this.submitting = true
      this.users = []
      this.invalidUsers = []
      this.groups = []

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
          const filteredResults = results.data.filter(user => {
            return user.name && user.email && (user.groupName || user.group || user.groupname)
          })

          // Clean up the results
          for (const user of filteredResults) {
            user.email = user.email.toLowerCase()
            user.name = user.name.replace(/\uFFFD/g, '')

            const group = user.groupName || user.groupname || user.group
            user.groupName = group.replace(/[^\x00-\x7F]/g, '')

            if (!regexValidEmail.test(user.email)) this.invalidUsers.push(user)
            else this.users.push(user)

            // Create array of unique groups
            if (!this.groups.includes(user.groupName)) this.groups.push(user.groupName)
          }

          // If invalid users, stop and show the users and the problems
          if (this.invalidUsers.length) {
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
      this.$message({ message: 'Please remove the existing file first.', type: 'error' })
    },
    downloadTemplate (e) {
      e.preventDefault()
      window.open('/default-template.csv')
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
