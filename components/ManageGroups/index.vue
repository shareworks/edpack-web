<template>
  <!-- Fullscreen -->
  <fullscreen :class="{ 'fullscreen-manage-groups': fullscreen }" ref="fullscreenManageGroups" @change="fullscreenChange">
      <div v-if="status === 'done'" :class="{ 'functional-disabled': manipulationDisabled }">

        <!-- Affix with filter and remove user logic -->
        <affix class="sticky-bar" :relative-element-selector="'.groups'" :offset="{ top: fullscreen ? 0 : 130, bottom: -1000 }">
          <transition-group name="drag-items-animation" mode="out-in">
            <!-- Filter -->
            <el-row type="flex" justify="center" align="baseline" v-if="!dragging" :key="1">
              <el-col :xs="20" :sm="16" :span="20">
                <!-- Add group button -->
                <el-button type="primary" plain size="medium" @click="addGroupDialog = true" :disabled="manipulationDisabled">
                  <i class="icon-add"/>
                  <span>{{ $t('SW_ADD_GROUP') }}</span>
                </el-button>

                <!-- Save button -->
                <el-button type="success" size="medium" :plain="!isChanged" :disabled="!isChanged || manipulationDisabled" @click="confirmSubmitChanges">
                  <i class="icon-ok-sign"/>
                  <span>{{ $t('SW_SAVE_CHANGES') }}</span>
                </el-button>

                <!-- Fullscreen -->
                <el-button type="text" class="hidden-xs ml-10" @click="toggleFullscreen">
                  <i class="icon-fullscreen"/>
                  <span>{{ $t(fullscreen ? 'SW_CLOSE_FULLSCREEN' : 'SW_FULLSCREEN') }}</span>
                </el-button>
              </el-col>

              <el-col :xs="4" :sm="8" :span="4" class="to-right">
                <!-- Search input -->
                <el-input prefix-icon="icon-search" :placeholder="$t('SW_SEARCH_STUDENTS')" size="medium" v-model="searchText" clearable/>
              </el-col>
            </el-row>

            <!-- Remove student area -->
            <el-row type="flex" align="middle" v-else-if="dragging && !draggingMainList" :key="2">
              <el-col :xs="0" :span="24">
                <div class="remove-draggable-wrapper">
                  <span class="copy-remove-user-title">{{ $t('SW_DRAG_REMOVE_STUDENTS') }}</span>
                  <draggable ghost-class="ghost" class="remove-students" :list="removedStudents" group="students" @change="confirmRemoveUser"/>
                </div>
              </el-col>
            </el-row>
          </transition-group>
        </affix>

        <div class="bar-placeholder"/>

        <el-row class="groups mt-20" :class="{ 'hide-shadow': fullscreen }" justify="center" :gutter="30">
          <el-col :xs="10" :sm="8" :md="6" class="unsorted-row">
            <!-- Full student list -->
            <full-student-list :key="fullStudentsKey" :setStudentsWithoutGroup="studentsData_SetStudentsWithoutGroup" :searchText="searchText.trim()" :manipulationDisabled="manipulationDisabled"
                               :studentsWithoutGroup="studentsData_GetStudentsWithoutGroup()" :setDragging="setDragging" :changeStudentGroup="changeStudentGroup"
                               :updateGroupCount="studentsData_UpdateGroupCount" :allStudents="studentsData_GetFullList()" :dragging="dragging"/>
          </el-col>

          <el-col :xs="14" :sm="16" :md="18" class="groups-row">
            <section class="groups-wrapper">
              <h3 class="collapse-header">
                <p class="question-sentence groups-header"><strong>{{ $tc('SW_GROUPS', 2) }}</strong> <el-tag class="ml-5" size="mini">{{ studentsData_GetGroupsList().length }}</el-tag></p>
              </h3>

              <!-- Students By Group -->
              <el-collapse @change="setActiveCollapseItems" class="group-collapse students-list-padding" v-if="studentsData_GetGroupsList().length">
                <el-collapse-item :name="group.name" v-for="(group, index) in studentsData_GetGroupsList()" :key="index">

                  <!-- Question title and number -->
                  <template slot="title">
                    <!-- Can drag student on the title -->
                      <h3 class="collapse-header">
                        <div class="question-number">{{ index + 1 }}</div>
                        <div class="basic-flex width-400">
                          <div class="question-sentence capitalize bold">{{ group.temporaryGroupName }}</div>
                          <!-- Drag to title -->
                          <draggable v-show="!activeCollapseItems[group.name]" ghost-class="ghost" class="group-students group-title-dragin" :class="{ 'can-drag-in': dragging }"
                                     :list="group.students" :sort="false" :group="{name: 'students', pull: true, put: true }"
                                     @change="changeStudentGroup($event, group.students)"/>
                        </div>

                        <div class="group-item-controls">
                          <div class="top-minus-3">
                            <!-- Remove group -->
                            <el-popconfirm :confirmButtonText="$t('SW_REMOVE')" :cancelButtonText="$t('SW_CANCEL')" @confirm="studentsData_RemoveGroup(group)" hideIcon :title="$t('SW_DELETE_GROUP')">
                              <el-button slot="reference" :disabled="manipulationDisabled" plain size="small" @click.stop class="button-square mr-5 hidden-xs" type="danger">
                                <i class="icon-delete"/>
                              </el-button>
                            </el-popconfirm>

                            <!-- Rename group -->
                            <el-popover @after-leave="studentsData_RenameStudentsGroup(group.name, group.temporaryGroupName)" trigger="click" :close-delay="0" :title="$tc('SW_CHANGE_GROUP_NAME')" placement="top-end">
                              <el-input v-model="group.temporaryGroupName" :placeholder="$t('SW_GROUP_NAME')" :label="$t('SW_GROUP_NAME')"/>

                              <el-button slot="reference" plain size="small" @click.stop class="button-square mr-10 hidden-xs">
                                <i class="icon-pencil"/>
                              </el-button>
                            </el-popover>
                          </div>

                          <el-tag class="question-tag-info hidden-xs" type="info">{{ countFilteredGroupsItem(group.students) }} {{ $tc('SW_STUDENT', countFilteredGroupsItem(group.students)).toLowerCase() }}</el-tag>
                        </div>
                      </h3>
                  </template>

                  <!-- Draggable student group list -->
                  <groups-item :manipulationDisabled="manipulationDisabled" :setDragging="setDragging" :changeStudentGroup="changeStudentGroup" :searchText="searchText.trim()" @updateGroupCount="studentsData_UpdateGroupCount" :group="{name: group.temporaryGroupName, _id: group._id}" :students="group.students" :class="{'can-drag-in': dragging}"/>
                </el-collapse-item>
              </el-collapse>
            </section>
          </el-col>
        </el-row>
      </div>

      <!-- Table status -->
      <table-status :status="status" :noneText="$t('SW_NO_STUDENTS_FOUND')"/>

    <!-- Add group dialog -->
    <el-dialog :title="$t('SW_ADD_GROUP')" append-to-body :visible.sync="addGroupDialog">
        <create-group-item :studentsByGroup="studentsData_GetGroupsList()" :closeCreateGroupDialog="closeCreateGroupDialog"/>
      </el-dialog>
  </fullscreen>
</template>

<script>
import Vue from 'vue'
import Affix from '../Affix'
import draggable from 'vuedraggable'
import GroupsItem from '../GroupsItem'
import fullscreen from 'vue-fullscreen'
import FullStudentList from '../FullStudentList'
import CreateGroupItem from '../CreateGroupItem'
import sortStudentsByGroup from '@/edpack-web/utils/sort-students-by-group'

Vue.use(fullscreen)

export default {
  name: 'ManageGroups',
  props: ['url', 'courseId', 'manipulationDisabled'],
  components: { Affix, GroupsItem, FullStudentList, draggable, CreateGroupItem },

  data () {
    return {
      fullscreen: false,
      muteRemoveWarning: false,
      addGroupDialog: false,
      isChanged: false,
      status: false,
      removedStudents: [],
      activeCollapseItems: {},
      dragging: false,
      draggingMainList: false,
      searchText: '',
      fullStudentsKey: 0,
      // studentsData: never try to access _inner_values, use studentsData functions
      studentsData: { _groupsList: [], _fullStudentsList: [], _studentsWithoutGroup: [] }
    }
  },

  mounted () {
    this.getStudents()
  },

  watch: {
    isChanged () { this.$store.dispatch('setUnsavedChanges', this.isChanged) }
  },

  methods: {
    // -----------------------
    // Students Data Functions
    // -----------------------
    studentsData_GetFullList () { return this.studentsData._fullStudentsList },
    studentsData_SetFullList (studentsList) { this.studentsData._fullStudentsList = studentsList },

    studentsData_GetStudentsWithoutGroup () { return this.studentsData._studentsWithoutGroup },
    studentsData_SetStudentsWithoutGroup (students) { this.studentsData._studentsWithoutGroup = students },

    studentsData_GetGroupsList () { return this.studentsData._groupsList },
    studentsData_SetGroupsList (groupsList) { this.studentsData._groupsList = groupsList },

    studentsData_RemoveStudent (studentToRemove) {
      // run over all groups
      this.studentsData_GetGroupsList().map(group => {
        // not target group - return group without changes
        if (group.groupName !== studentToRemove.groupName) return group

        // create new group with filtered students
        const filteredGroup = group.filter(student => { return student._id !== studentToRemove._id })

        // add name to the group
        filteredGroup.groupName = group.groupName
        return filteredGroup
      })
    },
    studentsData_RemoveGroup (group) {
      const updatedGroupsList = this.studentsData_GetGroupsList().filter(g => g.name !== group.name)
      this.studentsData_SetGroupsList(updatedGroupsList)
      this.studentsData_UpdateGroupCount(true)
    },

    studentsData_RenameStudentsGroup (oldName, newName) {
      if (oldName === newName) return

      const groups = this.studentsData_GetGroupsList()
      const groupIndex = groups.findIndex(group => group.temporaryGroupName === newName)

      groups[groupIndex].students.forEach(student => {
        student.groupName = newName
        student.group.name = newName
      })

      this.isChanged = true
    },
    studentsData_UpdateGroupCount (setIsChangedToTrue) {
      const studentsGroupAmount = {}
      const students = this.studentsData_GetGroupsList().map(group => { return group.students }).flat(1)
      this.fullStudentsKey += 1

      // count each student group amount
      students.forEach(student => {
        if (studentsGroupAmount[student._id]) { studentsGroupAmount[student._id]++ } else { studentsGroupAmount[student._id] = 1 }
      })

      const studentsList = this.studentsData_GetFullList()

      studentsList.forEach(student => {
        student.groupCount = studentsGroupAmount[student._id] || 0
      })

      if (setIsChangedToTrue) this.isChanged = true
    },
    // -----------------------
    // Get students
    getStudents () {
      if (this.status === 'loading') return
      this.status = 'loading'

      this.$http.get(`${this.url}/users`, { params: { course: this.courseId } })
        .then(res => {
          this.studentsData_SetFullList(res.data.list)
          this.studentsData_SetGroupsList(sortStudentsByGroup(res.data.list))
          this.studentsData_UpdateGroupCount()
          this.status = res.data.done ? 'done' : 'incomplete'
        })
        .catch(err => {
          console.log(err)
          this.status = 'error'
          this.$message({ message: this.$i18n.t('SW_GENERIC_ERROR'), type: 'error' })
        })
    },

    // Remove user
    confirmRemoveUser (action) {
      if (this.muteRemoveWarning) return this.removeUser(action)

      this.$confirm(this.$i18n.tc('SW_REMOVE_PARTICIPANT_FROM_GROUP_TEXT', 1), this.$i18n.tc('SW_REMOVE_PARTICIPANT_FROM_GROUP', 1), {
        confirmButtonText: this.$i18n.t('SW_REMOVE_SHOW_NEVER'),
        cancelButtonText: this.$i18n.t('SW_CANCEL')
      }).then(() => { this.removeUser(action) })
        .catch(() => { this.returnUserToGroup(action) })
    },
    removeUser (action) {
      // don't show remove warning anymore
      this.muteRemoveWarning = true
      this.studentsData_RemoveStudent(action.added.element)
      this.studentsData_UpdateGroupCount(true)
      this.$message({ message: this.$i18n.t('SW_USER_DELETED'), type: 'success' })
    },
    returnUserToGroup (action) {
      this.studentsData_GetGroupsList().map(group => {
        if (group.name === action.added.element.groupName) {
          group.students.push(action.added.element)
        }
        return group
      })
    },

    // Submit
    confirmSubmitChanges () {
      this.$confirm(this.$i18n.t('SW_MANAGE_STAFF_EFFECT'), this.$i18n.t('SW_SUBMIT_MANAGE_GROUP_TITLE'), {
        confirmButtonText: this.$i18n.t('SW_SAVE_CHANGES'),
        cancelButtonText: this.$i18n.t('SW_CANCEL')
      }).then(() => { this.submitChanges() })
    },
    submitChanges () {
      // get students from groups
      const students = this.studentsData_GetGroupsList().map(group => {
        return group.students.map(student => { return { ...student, groupName: group.temporaryGroupName, groupId: group._id } })
      }).flat(1)

      // newly moved students Without Group should be posted to
      const allAvailableStudents = [...students, ...this.studentsData_GetStudentsWithoutGroup()]

      // prepare participants for request
      const participants = allAvailableStudents.map(student => {
        return { groupName: student.groupName, groupId: student.groupId, email: student.email, userId: student._id }
      })

      const url = `${this.url}/sync-users`

      this.$http.put(url, { participants })
        .then(() => {
          this.getStudents()
          this.isChanged = false
          this.$store.dispatch('setUnsavedChanges', false)
          this.$emit('groupsUpdated')

          this.$message({ message: this.$i18n.t('SW_USERS_UPDATED'), type: 'success' })
        }).catch(err => {
          console.log(err)
          this.status = 'error'
          this.$message({ message: this.$i18n.t('SW_GENERIC_ERROR'), type: 'error' })
        })
    },

    // basically check that user not exist in group already
    changeStudentGroup (action, students) {
      if (!action.added) return

      // Is there is same students in group
      const sameStudentsInGroup = students.filter(stud => stud._id === action.added.element._id)

      // The draggable code will add students card anyway, even if the student already exist in such group
      // If it's happens, after that we find any duplicate of that user and removing it.
      if (sameStudentsInGroup.length <= 1) return

      // Find first same student and remove it
      const removeStudentIndex = students.findIndex(stud => stud._id === action.added.element._id)
      students.splice(removeStudentIndex, 1)
    },

    setActiveCollapseItems (activeCollapseItems) {
      const keysObject = {}
      activeCollapseItems.forEach(prop => keysObject[prop] = prop)
      this.activeCollapseItems = keysObject
    },

    countFilteredGroupsItem (students) {
      // have to count amount in ManageGroups, at this time it seems impossible to transfer logic beautifully
      if (!this.searchText.trim()) return students.length
      return students.filter(student => student.name.includes(this.searchText)).length
    },

    setDragging (value, draggingMainList) {
      this.dragging = value
      this.draggingMainList = draggingMainList
    },
    closeCreateGroupDialog () { this.addGroupDialog = false },
    fullscreenChange (fullscreen) { this.fullscreen = fullscreen },
    toggleFullscreen () { this.$refs.fullscreenManageGroups.toggle() }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import 'style';
</style>
