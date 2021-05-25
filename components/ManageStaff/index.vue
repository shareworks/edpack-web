<template>
  <div>
    <p class="mb-20">{{ $t('SW_DIALOG_MANAGE_STAFF_TEXT', [school.terminology.instructors[lang]]) }}</p>

    <el-row :gutter="10" v-if="!loading">
      <!-- Existing instructors -->
      <el-col :span="12" :xs="24">
        <p class="mb-10 bold">{{ $t('SW_CURRENT_STAFF_TEXT', [school.terminology.instructors[lang]]) }}</p>
        <div class="instructor-list">
          <!-- Instructor list -->
          <div v-for="instructor in instructors" class="text-ellipsis instructor-data" :key="instructor._id">
            <!-- Thumbnail -->
            <thumbnail :model="instructor" class="thumb-user thumb-42 mr-5"/>
            <div>
              <!-- Name -->
              <strong>{{instructor.name}}</strong>
              <div class="mb-20 font-12">
              <span v-if="instructor.activityDate">
                <!-- Activity Date -->
                <span class="online-icon"/>
                {{ fromNow(instructor.activityDate) }}
              </span>
                <!-- Invite pending -->
                <span v-else>{{ $t('SW_INVITE_PENDING') }}</span> &centerdot;

                <!-- Remove instructor -->
                <el-button :loading="removing" :disabled="instructors.length === 1" type="text" size="mini" @click="confirmRemove(instructor)">
                  <i class="icon-delete"/>
                  <span class="hidden-xs hidden-sm">{{ $t('SW_REMOVE') }}</span>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- Add instructors -->
      <el-col v-if="course.can.invite" :span="12" :xs="24">
        <users-create :isManageStaff="true" :course="course" :closeDialog="closeDialog" :updateMembers="updateMembers"/>
      </el-col>
    </el-row>

    <!-- Loading -->
    <spinner v-if="loading"/>
  </div>
</template>

<script>
import config from 'config'
import moment from 'moment'
import UsersCreate from '../UsersCreate'

export default {
  name: 'ManageStaff',
  props: ['closeDialog', 'updateMembers'],
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

  mounted () {
    this.getInstructors()
  },

  methods: {
    fromNow (date) { return moment(date).fromNow(true) },
    getInstructors () {
      this.loading = true

      this.$http.get('users', { params: { role: 'staff', entity: this.course._id } })
        .then((res) => { this.instructors = res.data.list })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.loading = false })
    },
    confirmRemove (instructor) {
      this.$confirm(this.$i18n.t('SW_REMOVE_INSTRUCTOR_CONFIRM', [this.school.terminology.instructor[this.lang]]), this.$i18n.t('SW_REMOVE_INSTRUCTOR'), {
        confirmButtonText: this.$i18n.t('SW_REMOVE'),
        cancelButtonText: this.$i18n.t('SW_CANCEL')
      }).then(() => { this.removeInstructor(instructor) })
    },
    removeInstructor (instructor) {
      this.removing = true
      const invitations = [{ recipientEmail: instructor.email, downgrade: true, contextId: this.course._id, role: 'none', sendEmail: false }]

      this.$http.post('users/invite', { invitations })
        .then(() => {
          this.updateMembers()
          this.getInstructors()
          this.$store.state.course.counts.staff = this.course.counts.staff

          const message = config.name === 'Comproved' ? 'SW_INSTRUCTORS_REMOVED' : 'SW_USERS_REMOVED'
          this.$message({ message: this.$i18n.t(message), type: 'success' })
        })
        .catch((err) => {
          console.log(err)
          this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') })
        })
        .finally(() => { this.removing = false })
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
