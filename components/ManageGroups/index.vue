<template>
  <div>
    <affix class="sticky-bar" relative-element-selector=".groups" :offset="{ top: 130, bottom: -1000 }">
      <transition-group name="drag-items-animation" mode="out-in">
        <!-- Filter -->
        <el-row type="flex" align="middle" v-if="!dragging" :key="1">
          <el-col :xs="24" :sm="16">
            <!-- Add group button -->
            <el-button type="primary" plain class="mr-5" size="medium" @click="addGroupDialog = true">
              <i class="icon-add"></i>
              <span v-if="!isMobile">{{ $t('SW_ADD_GROUP') }}</span>
            </el-button>

            <!-- Save button -->
            <el-button type="success" size="medium" :plain="!isChanged" :disabled="!isChanged" @click="confirmSubmitChanges">
              <i class="icon-ok-sign"></i>
              <span v-if="!isMobile">{{ $t('SW_SAVE_CHANGES') }}</span>
            </el-button>
          </el-col>

          <el-col :xs="0" :sm="8" class="hidden-xs hidden-sm to-left">
            <!-- Search input -->
            <el-input prefix-icon="icon-search" :placeholder="$t('SW_SEARCH_STUDENTS')" size="medium" v-model="searchText" clearable></el-input>
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
    </affix>
    <div class="bar-placeholder"></div>

      <el-row class="groups mt-20" justify="center" :gutter="20">
        <el-col :span="6" class="unsorted-row">
          <!-- Unsorted users -->
          <h3 class="collapse-header block">
            <p class="question-sentence groups-header"><strong>{{ $tc('SW_STUDENT', 2) }}</strong> <el-tag size="mini" class="ml-5">{{ showWithoutGroups ? unSorterStudents.length : filteredStudentList.length }}</el-tag></p>
            <p class="block"><el-checkbox v-model="showWithoutGroups">{{ $t('SW_WITHOUT_GROUP') }}</el-checkbox></p>
          </h3>
          <!-- Draggable unsorted students group list -->
          <groups-item class="unsorted-list" :class="{'can-drag-in': dragging && showWithoutGroups}" :totalStudentsList="!showWithoutGroups" :setDragging="setDragging" :checkIsChanged="checkIsChanged" :students="showWithoutGroups ? unSorterStudents : filteredStudentList"></groups-item>
        </el-col>

      <el-col :span="18">
        <h3 class="collapse-header">
          <p class="question-sentence groups-header"><strong>{{ $tc('SW_GROUPS', 2) }}</strong> <el-tag class="ml-5" size="mini">{{ students.length }}</el-tag></p>
        </h3>

        <el-collapse class="group-collapse" v-if="students.length">
          <el-collapse-item v-for="(group, index) in students" :key="index">

            <!-- Question title and number -->
            <template slot="title">
              <h3 class="collapse-header">
                <div class="question-number">{{ index + 1 }}</div>
                <div class="question-sentence capitalize bold">{{ group.groupName }}</div>

                <!-- Remove group -->
                <el-popconfirm :confirmButtonText="$t('SW_REMOVE')" :cancelButtonText="$t('SW_CANCEL')" @onConfirm="removeGroup(group)"
                               class="delete-group-button" hideIcon :title="$t('SW_DELETE_GROUP')">
                  <el-button v-if="!isMobile" slot="reference" plain size="small" @click.stop class="button-square mr-10 delete-group-button hidden-xs" type="danger">
                    <i class="icon-delete"></i>
                  </el-button>
                </el-popconfirm>

                <el-popover trigger="click" class="edit-group-button" :close-delay="0" :ref="`edit_${index}`" :title="$tc('SW_CHANGE_GROUP_NAME')" placement="top-end">
                  <el-input v-model="temporaryGroupName" @input="updateGroupName($event, index)" :placeholder="$t('SW_GROUP_NAME')" :label="$t('SW_GROUP_NAME')"></el-input>

                  <el-button slot="reference" @click="afterLeave($event, index)" plain size="small" @click.stop class="button-square mr-10 delete-group-button hidden-xs">
                    <i class="icon-pencil"></i>
                  </el-button>
                </el-popover>

                <el-tag class="question-tag-info hidden-xs" type="info">{{ group.length }} {{ $tc('SW_STUDENT', group.length).toLowerCase() }}</el-tag>
              </h3>
            </template>

              <!-- Draggable student group list -->
              <groups-item :setDragging="setDragging" :checkIsChanged="checkIsChanged" :students="group" :class="{'can-drag-in': dragging}"></groups-item>
            </el-collapse-item>
          </el-collapse>
        </el-col>
      </el-row>

    <!-- Add group dialog -->
    <el-dialog :title="$t('SW_ADD_GROUP')" append-to-body :visible.sync="addGroupDialog">
      <!-- Group name -->
      <el-form label-position="top">
        <el-form-item required :label="`${$t('SW_GROUP_NAME')}:`">
          <el-input placeholder="The Kangaroos" v-model="newGroupName" @keydown.enter.native.prevent="addNewGroup"></el-input>
        </el-form-item>

        <el-form-item class="mt-20">
          <el-button type="primary" @click="addNewGroup">
            {{ $t('SW_ADD_GROUP') }}
            <i class="icon-arrow_forward"></i>
          </el-button>
          <el-button type="text" class="ml-10" @click="addGroupDialog = false">{{ $t('SW_CANCEL') }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <table-status :status="status" :noneText="$t('SW_NO_STUDENTS_FOUND')" @clearSearch="clearSearch"></table-status>
  </div>
</template>

<script>
import Affix from '../Affix'
import isEqual from 'lodash/isEqual'
import draggable from 'vuedraggable'
import debounce from 'lodash/debounce'
import GroupsItem from '../GroupsItem'
import TableStatus from '../TableStatus'

export default {
  name: 'ManageGroups',
  props: ['setIsChanged', 'isChanged', 'url'],
  components: { TableStatus, Affix, GroupsItem, draggable },

  data () {
    return {
      filteredStudentList: [],
      removeUserDialogActivated: false,
      showWithoutGroups: false,
      temporaryGroupName: '',
      addGroupDialog: false,
      status: '',
      students: [],
      removedStudents: [],
      unSorterStudents: [],
      fullStudentsList: [],
      dragging: false,
      searchText: this.$route.query.query || '',
      isMobile: this.$store.state.isMobile,
      newGroupName: '',
      inLTI: this.$store.state.inLTI,
      duplicatedStudents: []
    }
  },

  watch: {
    searchText: debounce(function () {
      this.$router.replace({ query: { query: this.searchText } })
    }, 400),
    $route () { this.filterStudents() }
  },

  mounted () {
    if (this.inLTI) {
      return window.history.length > 1 ? this.$router.back() : this.router.push('/')
    }
    this.getStudents()
  },

  methods: {
    confirmRemoveUser (action) {
      if (this.removeUserDialogActivated) {
        return this.removeUser(action)
      }

      this.$confirm(this.$i18n.tc('SW_REMOVE_PARTICIPANT_TEXT', 1), this.$i18n.tc('SW_REMOVE_PARTICIPANT', 1), {
        confirmButtonText: this.$i18n.t('SW_REMOVE_SHOW_NEVER'),
        cancelButtonText: this.$i18n.t('SW_CANCEL')
      }).then(() => { this.removeUser(action) })
        .catch(() => { this.returnUserToGroup(action) })
    },
    returnUserToGroup (action) {
      this.students = this.students.map(group => {
        if (group.groupName !== action.added.element.groupName) {
          return group
        }

        group.push(action.added.element)
        return group
      })

      this.removedStudents = []
    },
    confirmSubmitChanges () {
      this.$confirm(this.$i18n.t('SW_MANAGE_STAFF_EFFECT'), this.$i18n.t('SW_SUBMIT_MANAGE_GROUP_TITLE'), {
        confirmButtonText: this.$i18n.t('SW_SAVE_CHANGES'),
        cancelButtonText: this.$i18n.t('SW_CANCEL')
      }).then(() => { this.submitChanges() })
    },

    afterLeave (value, index) {
      this.students.forEach((st, i) => {
        if (index !== i) {
          this.$refs[`edit_${i}`][0].doClose()
        }
      })
      this.temporaryGroupName = this.students[index].groupName
    },
    updateGroupName (result, index) {
      this.setIsChanged(true)

      this.students[index] = this.students[index].map(stud => {
        //add new group name to the each student
        stud.groupName = result
        stud.group.name = result
        return stud
      })

      this.students[index].groupName = result
    },
    removeGroup (group) {
      const cleanedStudents = group.map(stud => {
        delete stud.group
        delete stud.groupName
        return stud
      })

      cleanedStudents.forEach(stud => { this.unSorterStudents.push(stud) })
      this.students = this.students.filter(g => g.groupName !== group.groupName)
      this.setIsChanged(true)
    },
    removeUser (action) {
      this.removeUserDialogActivated = true

      this.students = this.students.map(group => {
        if (group.groupName !== action.added.element.groupName) {
          return group
        }

        return group.filter(student => {
          return student._id !==  action.added.element._id
        })
      })

      this.setIsChanged(true)
      this.removedStudents = []
    },
    setFilteredStudentsList (students) {
      this.filteredStudentList = []

      students.forEach(student => {
        const studentAlreadyExist = this.filteredStudentList.find(stud => { return stud._id === student._id })

        if (!studentAlreadyExist) {
          this.filteredStudentList.push(student)
        }
      })
    },
    setDragging (value) { this.dragging = value },
    getStudents () {
      if (this.status === 'loading') return
      this.status = 'loading'

      const params = { filter: this.searchText }
      this.$http.get(`${this.url}/users`, { params }).then(
        res => {
          this.fullStudentsList = res.data.list
          this.separateGroup(res.data.list)
          this.setFilteredStudentsList(res.data.list)

          this.status = res.data.total ? (res.data.done ? 'done' : 'incomplete') : (this.searchText ? 'noResults' : 'none')
        }).catch(
        err => {
          console.log(err)
          this.status = 'error'
          this.$message({ message: this.$i18n.t('SW_GENERIC_ERROR'), type: 'error' })
        })
    },

    clearSearch () { this.searchText = '' },

    filterStudents () {
      const regExpression = new RegExp(this.searchText.toLowerCase())

      const students = this.fullStudentsList.filter(student => {
        return student.name.toLowerCase().match(regExpression)
      })

      this.separateGroup(students)
    },

    separateGroup (students) {
      const groups = {}

      this.students = []
      this.unSorterStudents = []
      this.duplicatedStudents = []

      // move each student to group
      students.forEach(user => {
        if (!user.groupName || user.groupName === '' || !user.group) {
          this.unSorterStudents.push(user)
          return
        }

        if (!groups[user.groupName]) {
          groups[user.groupName] = user.group
          groups[user.groupName].students = []
        }

        // add user to group
        groups[user.groupName].students.push(user)
      })

      // return sorted students in array
      const studentsArray = []

      for (const key in groups) {
        studentsArray.push(groups[key].students)
        studentsArray[studentsArray.length - 1].groupName = groups[key].name
      }

      this.students = studentsArray
      this.students.sort(this.groupNameSort)
      this.duplicatedStudents = [...this.students.flat(2)]
    },

    checkIsChanged () {
      this.setIsChanged(!isEqual(this.duplicatedStudents, this.students.flat(2)))
    },

    addNewGroup () {
      const group = []
      const newName = this.newGroupName.trim()

      if (!newName) return this.$message({ message: this.$i18n.t('SW_GROUP_REQUIRED'), type: 'error' })

      // check if name is unique
      const filtered = this.students.filter(({ groupName }) => groupName.toLowerCase() === newName.toLowerCase())

      if (filtered.length === 0) {
        // Success
        group.groupName = newName
        this.students.push(group)
        this.newGroupName = ''
        this.addGroupDialog = false
        this.$message({ message: this.$i18n.t('SW_ADDED_GROUP'), type: 'success' })
      } else {
        // Unsuccess
        this.$message({ message: this.$i18n.t('SW_GROUP_NOT_UNIQUE'), type: 'error' })
      }
    },

    groupNameSort (a, b) {
      if (a.groupName < b.groupName) { return -1 }
      if (a.groupName > b.groupName) { return 1 }
      return 0
    },

    submitChanges () {
      // prepare participants for request
      const participants = []

      // get students from groups
      let students = [...this.students, this.unSorterStudents].flat(1)

      // if there is search text return filtered users the list
      if (this.searchText !== '') {
        const newFullStudentsList = []

        this.fullStudentsList.forEach(student => {
          // find is user has been filtered
          const user = students.filter(st => st._id === student._id)
          if (user.length) {
            newFullStudentsList.push(user[0])
          } else {
            newFullStudentsList.push(student)
          }
        })

        // update students lists
        students = newFullStudentsList
        this.fullStudentsList = newFullStudentsList
      }

      // process all participants form request
      for (const student of students) {
        participants.push({
          groupName: student.groupName,
          email: student.email
        })
      }

      this.$http.put(`${this.url}/sync-users`, { participants }).then(
        () => {
          this.students = []
          this.unSorterStudents = []
          this.fullStudentsList = []

          this.clearSearch()
          this.getStudents()
          this.setIsChanged(false)

          this.$message({ message: this.$i18n.t('SW_USERS_UPDATED'), type: 'success' })
        }).catch(
        err => {
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
