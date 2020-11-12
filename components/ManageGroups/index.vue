<template>
  <div>
    <div v-if="status === 'done'">
      <affix class="sticky-bar" relative-element-selector=".groups" :offset="{ top: 130, bottom: -1000 }">
        <div class="manage-groups-bar">
          <transition-group name="drag-items-animation" mode="out-in">
            <!-- Filter -->
            <el-row type="flex" align="middle" v-if="!dragging" :key="1">
              <el-col :xs="24" :sm="16">
                <!-- Add group button -->
                <el-button type="primary" plain size="medium" @click="addGroupDialog = true">
                  <i class="icon-add"></i>
                  <span>{{ $t('SW_ADD_GROUP') }}</span>
                </el-button>

                <!-- Save button -->
                <el-button type="success" size="medium" :plain="!isChanged" :disabled="!isChanged" @click="confirmSubmitChanges">
                  <i class="icon-ok-sign"></i>
                  <span>{{ $t('SW_SAVE_CHANGES') }}</span>
                </el-button>
              </el-col>

              <el-col :xs="0" :sm="8" class="hidden-xs hidden-sm to-left">
                <!-- Search input -->
                <el-input prefix-icon="icon-search" class="hide" :placeholder="$t('SW_SEARCH_STUDENTS')" size="medium" v-model="searchText" clearable></el-input>
              </el-col>
            </el-row>

            <el-row type="flex" align="middle" v-else :key="2">
              <el-col :xs="0" :span="24">
                <div class="remove-draggable-wrapper">
                  <span class="copy-remove-user-title">{{ $t('SW_DRAG_REMOVE_STUDENTS') }}</span>
                  <draggable ghost-class="ghost" class="remove-students" :list="removedStudents" group="students" @change="confirmRemoveUser"></draggable>
                </div>
              </el-col>
            </el-row>
          </transition-group>
        </div>
      </affix>
      <div class="bar-placeholder"></div>

      <el-row class="groups mt-20" justify="center" :gutter="30">
        <el-col :span="5" class="unsorted-row">
          <full-student-list :key="fullKey" :setStudentsWithoutGroup="setStudentsWithoutGroup" :studentsWithoutGroup="studentsWithoutGroup" :setDragging="setDragging" :updateGroupCount="updateGroupCount" :allStudents="allStudents" :dragging="dragging" />
        </el-col>

        <el-col :span="19" class="groups-row">
          <section class="groups-wrapper">
            <h3 class="collapse-header">
              <p class="question-sentence groups-header"><strong>{{ $tc('SW_GROUPS', 2) }}</strong> <el-tag class="ml-5" size="mini">{{ studentsByGroup.length }}</el-tag></p>
            </h3>

            <el-collapse class="group-collapse" v-if="studentsByGroup.length">
              <el-collapse-item v-for="(group, index) in studentsByGroup" :key="index">

                <!-- Question title and number -->
                <template slot="title">
                  <h3 class="collapse-header">
                    <div class="question-number">{{ index + 1 }}</div>
                    <div class="question-sentence capitalize bold">{{ group.temporaryGroupName }}</div>

                    <!-- Remove group -->
                    <el-popconfirm :confirmButtonText="$t('SW_REMOVE')" :cancelButtonText="$t('SW_CANCEL')" @onConfirm="removeGroup(group)"
                                   class="delete-group-button" hideIcon :title="$t('SW_DELETE_GROUP')">
                      <el-button slot="reference" plain size="small" @click.stop class="button-square mr-5 delete-group-button hidden-xs" type="danger">
                        <i class="icon-delete"></i>
                      </el-button>
                    </el-popconfirm>

                    <!-- Rename group -->
                    <el-popover @after-leave="renameStudentsGroup(group.name, group.temporaryGroupName)" trigger="click" class="edit-group-button" :close-delay="0" :title="$tc('SW_CHANGE_GROUP_NAME')" placement="top-end">
                      <el-input v-model="group.temporaryGroupName" :placeholder="$t('SW_GROUP_NAME')" :label="$t('SW_GROUP_NAME')"></el-input>

                      <el-button slot="reference" plain size="small" @click.stop class="button-square mr-10 delete-group-button hidden-xs">
                        <i class="icon-pencil"></i>
                      </el-button>
                    </el-popover>

                    <el-tag class="question-tag-info hidden-xs" type="info">{{ group.students.length }} {{ $tc('SW_STUDENT', group.students.length).toLowerCase() }}</el-tag>
                  </h3>
                </template>

                <!-- Draggable student group list -->
                <groups-item :setDragging="setDragging" @updateGroupCount="updateGroupCount" :group="{name: group.temporaryGroupName, _id: group._id}" :students="group.students" :class="{'can-drag-in': dragging}"/>
              </el-collapse-item>
            </el-collapse>
          </section>
        </el-col>
      </el-row>
    </div>

    <table-status :status="status" :noneText="$t('SW_NO_STUDENTS_FOUND')"></table-status>

    <!-- @TODO: separate component - Add group dialog -->
    <el-dialog :title="$t('SW_ADD_GROUP')" append-to-body :visible.sync="addGroupDialog">
      <create-group-item :studentsByGroup="studentsByGroup" :closeCreateGroupDialog="closeCreateGroupDialog"/>
    </el-dialog>
  </div>
</template>

<script>
import Affix from '../Affix'
import draggable from 'vuedraggable'
import GroupsItem from '../GroupsItem'
import TableStatus from '../TableStatus'
import FullStudentList from '../FullStudentList'
import CreateGroupItem from '../CreateGroupItem'

export default {
  name: 'ManageGroups',
  props: ['setIsChanged', 'isChanged', 'url', 'courseId', 'assessment'],
  components: { TableStatus, Affix, GroupsItem, FullStudentList, draggable, CreateGroupItem },

  data () {
    return {
      muteRemoveWarning: false,
      addGroupDialog: false,
      status: false,
      removedStudents: [],
      studentsByGroup: [],
      allStudents: [],
      studentsWithoutGroup: [],
      dragging: false,
      searchText: this.$route.query.query || '',
      fullKey: 0
    }
  },

  mounted () {
    this.getStudents()
  },

  methods: {
    setStudentsWithoutGroup (value) { this.studentsWithoutGroup = value },
    closeCreateGroupDialog () { this.addGroupDialog = false },
    renameStudentsGroup (oldName, newName) {
      if (oldName === newName) return
      const groupIndex = this.studentsByGroup.findIndex(group => { return group.temporaryGroupName === newName })

      this.studentsByGroup[groupIndex].students.forEach(student => {
        student.groupName = newName
        student.group.name = newName
      })

      this.setIsChanged(true)
    },
    getStudents () {
      if (this.status === 'loading') return
      this.status = 'loading'

      const params = { filter: this.searchText }

      // @TODO Comproved specific fix?
      if (this.assessment) params.course = this.assessment.course._id

      this.$http.get(`${this.url}/users`, { params })
        .then(res => {
          this.allStudents = res.data.list
          this.sortStudentsByGroup(res.data.list)
          this.updateGroupCount()
          this.status = res.data.total ? (res.data.done ? 'done' : 'incomplete') : (this.searchText ? 'noResults' : 'none')
        })
        .catch(err => {
          console.log(err)
          this.status = 'error'
          this.$message({ message: this.$i18n.t('SW_GENERIC_ERROR'), type: 'error' })
        })
    },
    updateGroupCount (setIsChangedToTrue) {
      const studentsGroupAmount = {}
      const students = this.studentsByGroup.map(group => { return group.students }).flat(1)
      this.fullKey += 1

      // count each student group amount
      students.forEach(student => {
        if (studentsGroupAmount.hasOwnProperty(student._id)) { studentsGroupAmount[student._id]++ }
        else { studentsGroupAmount[student._id] = 1 }
      })

      this.allStudents.forEach(student => {
        student.groupCount = studentsGroupAmount[student._id] || 0
      })

      if (setIsChangedToTrue) {
        this.setIsChanged(true)
      }
    },
    sortStudentsByGroup (unsortedStudents) {
      const groups = []

      unsortedStudents.forEach(user => {
        if (!user.groupName) return

        const groupIndex = groups.findIndex(group => group.name === user.groupName)
        if (groupIndex > -1) return groups[groupIndex].students.push(user)

        // Create & add group with student
        groups.push({ name: user.groupName, _id: user.group._id, temporaryGroupName: user.groupName, students: [user] })
      })

      this.studentsByGroup = groups.sort(this.groupNameSort)
    },
    confirmRemoveUser (action) {
      if (this.muteRemoveWarning) return this.removeUser(action)

      this.$confirm(this.$i18n.tc('SW_REMOVE_PARTICIPANT_TEXT', 1), this.$i18n.tc('SW_REMOVE_PARTICIPANT', 1), {
        confirmButtonText: this.$i18n.t('SW_REMOVE_SHOW_NEVER'),
        cancelButtonText: this.$i18n.t('SW_CANCEL')
      }).then(() => { this.removeUser(action) })
        .catch(() => { this.returnUserToGroup(action) })
    },
    returnUserToGroup (action) {
      this.studentsByGroup = this.studentsByGroup.map(group => {
        if (group.name === action.added.element.groupName) {
          group.students.push(action.added.element)
        }
        return group
      })
    },
    removeUser (action) {
      this.muteRemoveWarning = true

      this.studentsByGroup = this.studentsByGroup.map(group => {
        if (group.groupName !== action.added.element.groupName) {
          return group
        }

        const filteredGroup = group.filter(student => {
          return student._id !== action.added.element._id
        })

        filteredGroup.groupName = group.groupName
        return filteredGroup
      })

      this.updateGroupCount(true)
      this.$message({ message: this.$i18n.t('SW_USER_DELETED'), type: 'success' })
    },
    confirmSubmitChanges () {
      this.$confirm(this.$i18n.t('SW_MANAGE_STAFF_EFFECT'), this.$i18n.t('SW_SUBMIT_MANAGE_GROUP_TITLE'), {
        confirmButtonText: this.$i18n.t('SW_SAVE_CHANGES'),
        cancelButtonText: this.$i18n.t('SW_CANCEL')
      }).then(() => { this.submitChanges() })
    },
    removeGroup (group) {
      this.studentsByGroup = this.studentsByGroup.filter(g => g.name !== group.name)
      this.updateGroupCount(true)
    },
    setDragging (value) { this.dragging = value },
    groupNameSort (a, b) {
      if (a.name < b.name) { return -1 }
      if (a.name > b.name) { return 1 }
      return 0
    },
    submitChanges () {
      // get students from groups
      const students = this.studentsByGroup.map(group => {
        return group.students.map(student => { return { ...student, groupName: group.temporaryGroupName, groupId: group._id } })
      }).flat(1)

      // newly moved studentsWithoutGroup should be posted to
      const allAvailableStudents = [...students, ...this.studentsWithoutGroup]

      // prepare participants for request
      const participants = allAvailableStudents.map(student => {
        return { groupName: student.groupName, groupId: student.groupId, email: student.email, userId: student._id }
      })

      // @TODO comproved specific fix? -- yes
      const url = this.assessment ? `assessments/${this.assessment._id}/sync-users` : `${this.url}/sync-users`

      this.$http.put(url, { participants })
        .then(() => {
          this.studentsWithoutGroup = []
          this.studentsByGroup = []
          this.allStudents = []
          this.getStudents()
          this.setIsChanged(false)

          this.$message({ message: this.$i18n.t('SW_USERS_UPDATED'), type: 'success' })
        }).catch(err => {
          console.log(err)
          this.status = 'error'
          this.$message({ message: this.$i18n.t('SW_GENERIC_ERROR'), type: 'error' })
        })
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import 'style';
</style>
