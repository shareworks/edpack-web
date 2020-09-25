<template>
  <div>
    <affix class="sticky-bar" relative-element-selector=".groups" :offset="{ top: 130, bottom: -1000 }">

      <transition-group name="drag-items-animation" mode="out-in">
        <!-- Filter -->
        <el-row type="flex" align="middle" v-if="!dragging" :key="1">
          <el-col :xs="24" :sm="8">
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
              <div class="draggable-wrapper ml-10">
                <span class="text-muted copy-user-title">{{ $t('SW_COPY_USER') }}</span>
                <draggable ghost-class="ghost" class="group-students copy-students" :list="unSorterStudents" group="students" @change="copyStudent"></draggable>
              </div>

              <div class="draggable-wrapper ml-10">
                <span class="text-muted copy-user-title">{{ $tc('SW_REMOVE_STUDENTS', 1) }}</span>
                <draggable ghost-class="ghost" class="group-students copy-students" :list="removedStudents" group="students" @change="removeUser"></draggable>
              </div>
            </el-col>
        </el-row>
      </transition-group>

    </affix>
    <div class="bar-placeholder"></div>

      <el-row class="groups mt-20" justify="center" :gutter="20">
        <el-col :span="6" class="unsorted-row">
          <!-- Unsorted users -->
          <h3 class="collapse-header">
            <p class="question-sentence groups-header"><strong>{{ $t('SW_WITHOUT_GROUP') }}</strong> <el-tag size="mini" class="ml-5">{{ unSorterStudents.length }}</el-tag></p>
          </h3>
          <!-- Draggable unsorted students group list -->
          <groups-item :setDragging="setDragging" :checkIsChanged="checkIsChanged" :students="unSorterStudents"></groups-item>
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
                  <el-button slot="reference" plain size="small" @click.stop class="button-square mr-10 delete-group-button" type="danger">
                    <i class="icon-delete"></i>
                  </el-button>
                </el-popconfirm>

                <el-tag class="question-tag-info" type="info">{{ group.length }} {{ $tc('SW_STUDENT', group.length).toLowerCase() }}</el-tag>
              </h3>
            </template>

              <!-- Draggable student group list -->
              <groups-item :setDragging="setDragging" :checkIsChanged="checkIsChanged" :students="group"></groups-item>
            </el-collapse-item>
          </el-collapse>
        </el-col>
      </el-row>

    <!-- Add group dialog -->
    <el-dialog :title="$t('SW_ADD_GROUP')" append-to-body :visible.sync="addGroupDialog">
      <!-- Group name -->
      <el-form>
        <el-form-item required :label="`${$t('SW_GROUP_NAME')}`">
          <el-input placeholder="The Kangaroos" v-model="newGroupName"></el-input>
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
import cloneDeep from 'lodash/cloneDeep'
import TableStatus from '../TableStatus'
import GroupsItem from '@/components/GroupsItem'

export default {
  name: 'ManageGroups',
  props: ['setIsChanged', 'isChanged', 'url'],
  components: { TableStatus, Affix, GroupsItem, draggable },

  data () {
    return {
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
      window.history.length > 1 ? this.$router.back() : this.router.push('/')
    }
    this.getStudents()
  },

  methods: {
    setDragging (value) { this.dragging = value },
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
      // probably can delete this - need to test after api /sync-users fix

      // this.students = this.students.map(group => {
      //   if (group.groupName !== action.added.element.groupName) {
      //     return group
      //   }
      //
      //   return group.filter(student => {
      //     return student._id !==  action.added.element._id
      //   })
      // })

      this.setIsChanged(true)
      this.removedStudents = []
    },
    copyStudent (action) {
      if (!action.added.element.groupName) {
        // can't clone unsorted student
        return
      }

      // clone student
      const studentCopy = cloneDeep(action.added.element)

      this.students.forEach(group => {
        if (group.groupName === studentCopy.groupName) {
          // return student copy to the group
          group.push(studentCopy)
        }
      })

      // for original element which will be moved to students without group
      delete action.added.element.group
      delete action.added.element.groupName

      this.checkIsChanged()
    },

    getStudents () {
      if (this.status === 'loading') return
      this.status = 'loading'

      const params = { filter: this.searchText }
      this.$http.get(`${this.url}/users`, { params }).then(
        res => {
          this.fullStudentsList = res.data.list
          this.separateGroup(res.data.list)

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

    confirmSubmitChanges () {
      this.$confirm(this.$i18n.t('SW_MANAGE_STAFF_EFFECT'), this.$i18n.t('SW_SUBMIT_MANAGE_GROUP_TITLE'), {
        confirmButtonText: this.$i18n.t('SW_SAVE_CHANGES'),
        cancelButtonText: this.$i18n.t('SW_CANCEL')
      }).then(() => { this.submitChanges() })
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
