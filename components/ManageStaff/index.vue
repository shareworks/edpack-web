<template>
  <div>
    <p class="mb-20">{{ $t('SW_DIALOG_MANAGE_STAFF_TEXT') }}</p>

    <el-row :gutter="10" v-if="!loading">
      <!-- Existing instructors -->
      <el-col :span="12" :xs="24">
        <p class="mb-10 bold">{{ $t('SW_CURRENT_STAFF_TEXT') }}</p>
        <div class="instructor-list">
          <div v-for="instructor in instructors" class="text-ellipsis instructor-data" :key="instructor._id">
            <thumbnail :model="instructor" class="thumb-user thumb-42 mr-5"></thumbnail>
            <div>
              <strong>{{instructor.name}}</strong>
              <div class="mb-20 font-12">
              <span v-if="instructor.activityDate">
                <span class="online-icon"></span>
                {{ instructor.activityDate | fromNow }}
              </span>
                <span v-else>{{ $t('SW_INVITE_PENDING') }}</span> &centerdot;
                <el-button :loading="removing" :disabled="instructors.length === 1" type="text" size="mini" @click="removeInstructor(instructor)">
                  <i class="icon-delete"></i>
                  <span class="hidden-xs hidden-sm">{{ $t('SW_REMOVE') }}</span>
                </el-button>
              </div>
            </div>

          </div>
        </div>
      </el-col>
      <!-- Add instructors -->
      <el-col :span="12" :xs="24">
        <users-create :isManageStaff="true" :course="course" :closeDialog="closeDialog"></users-create>
      </el-col>
    </el-row>

    <!-- Loading -->
    <spinner v-if="loading"></spinner>
  </div>
</template>

<script>
import moment from 'moment'
import UsersCreate from '../UsersCreate'

export default {
  name: 'ManageStaff',
  props: ['closeDialog'],
  components: { UsersCreate },

  data () {
    return {
      course: this.$store.state.course,
      school: this.$store.state.school,
      user: this.$store.state.user,
      lang: this.$store.state.lang,
      instructors: [],
      loading: false,
      removing: false,
      sending: false,
      form: { recipients: '', toSelf: true }
    }
  },

  filters: {
    fromNow: function (date) { return moment(date).fromNow(true) }
  },

  mounted () {
    this.getInstructors()
  },

  methods: {
    getInstructors () {
      this.loading = true

      this.$http.get('users', { params: { role: 'staff', entity: this.course._id } })
        .then((res) => { this.instructors = res.data.list })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.loading = false })
    },
    addUsers () {
      if (this.sending) return
      const toSelf = this.form.toSelf

      // Convert string to emails
      let emails = this.form.recipients.replace(/\n/g, ',').split(',')
      emails = emails.map(email => email.trim())

      // Filter all emails that don't have a @
      emails = emails.filter(email => email.includes('@'))

      // Do something when no emails given
      if (!emails.length) return

      const roles = []

      // Add course role as staff
      for (const email of emails) {
        roles.push({
          email, model: 'course', id: this.course._id, role: 'staff'
        })
      }

      this.sending = true
      this.$http.post('users/invite', { roles }, { params: { toSelf } })
        .then(() => {
          this.form.recipients = ''
          this.$store.state.course.counts.staff = this.course.counts.staff + roles.length
          this.getInstructors()
          this.$message({ message: this.$i18n.t('SW_EMAILS_SENT'), type: 'success' })
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.sending = false })
    },
    confirmRemove (instructor) {
      this.$confirm(this.$i18n.t('SW_REMOVE_INSTRUCTOR_CONFIRM'), this.$i18n.t('SW_REMOVE_INSTRUCTOR'), {
        confirmButtonText: this.$i18n.t('SW_REMOVE'),
        cancelButtonText: this.$i18n.t('SW_CANCEL')
      }).then(() => { this.removeInstructor(instructor) })
    },
    removeInstructor (instructor) {
      this.removing = true
      const roles = [{ email: instructor.email, model: 'course', id: this.course._id, role: 'none' }]

      this.$http.post('users/invite', { roles })
        .then(() => {
          this.getInstructors()
          this.$store.state.course.counts.staff = this.course.counts.staff - roles.length
          this.$message({ message: this.$i18n.t('SW_USERS_REMOVED'), type: 'success' })
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.removing = false })
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
