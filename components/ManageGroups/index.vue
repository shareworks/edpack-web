<template>
  <div>
    <affix class="sticky-bar" relative-element-selector=".groups" :offset="{ top: 130, bottom: -1000 }">
      <!-- Filter -->
      <el-row type="flex" align="middle">
        <el-col :xs="24" :sm="8">
          <!-- Add group button -->
          <el-button type="primary" plain class="mr-5" size="medium" @click="addGroupDialog = true">
            <i class="icon-add"></i>
            <span v-if="!isMobile">{{ $t('SW_ADD_GROUP') }}</span>
          </el-button>

          <!-- Save button -->
          <el-button type="success" size="medium" :plain="!isChanged" @click="submitChanges">
            <i class="icon-ok-sign"></i>
            <span v-if="!isMobile">{{ $t('SW_SAVE_CHANGES') }}</span>
          </el-button>
        </el-col>

        <el-col :xs="0" :span="8">
          <div class="draggable-wrapper ml-10">
            <span class="text-muted copy-user-title">{{ $t('SW_COPY_USER') }}</span>
            <draggable ghost-class="ghost" class="group-students copy-students" :list="unSorterStudents" group="students" @change="copyStudent"></draggable>
          </div>
        </el-col>

        <el-col :xs="0" :sm="8" class="hidden-xs">
          <!-- Search input -->
          <el-input prefix-icon="icon-search" :placeholder="$t('SW_SEARCH_STUDENTS')" size="medium" v-model="searchText" clearable></el-input>
        </el-col>
      </el-row>
    </affix>
    <div class="bar-placeholder"></div>

      <el-row class="groups mt-20" justify="center" :gutter="20">
        <el-col :span="6" class="unsorted-row">
          <!-- Unsorted users -->
          <h3 class="collapse-header">
            <p class="question-sentence groups-header">{{ $t('SW_WITHOUT_GROUP') }}</p>
            <el-tag type="info" size="large">{{ unSorterStudents.length }} {{ $tc('SW_STUDENT', unSorterStudents.length).toLowerCase() }}</el-tag>
          </h3>
          <!-- Draggable unsorted students group list -->
          <groups-item :checkIsChanged="checkIsChanged" :students="unSorterStudents"></groups-item>
        </el-col>

      <el-col :span="18">
        <h3 class="collapse-header">
          <p class="question-sentence groups-header">{{ $tc('SW_GROUPS', 2) }}</p>
          <el-tag type="info" size="large">{{ students.length }} {{ $tc('SW_GROUPS', students.length).toLowerCase() }}</el-tag>
        </h3>

        <el-collapse class="group-collapse" v-if="students.length">
          <el-collapse-item v-for="(group, index) in students" :key="index">

            <!-- Question title and number -->
            <template slot="title">
              <h3 class="collapse-header">
                <div class="question-number">{{ index + 1 }}</div>
                <div class="question-sentence capitalize">{{ group.groupName }}</div>
                <el-tag class="question-tag-info" type="info">{{ group.length }} {{ $tc('SW_STUDENT', group.length).toLowerCase() }}</el-tag>
              </h3>
            </template>

              <!-- Draggable student group list -->
              <groups-item :checkIsChanged="checkIsChanged" :students="group"></groups-item>
            </el-collapse-item>
          </el-collapse>
        </el-col>
      </el-row>

    <!-- Add group dialog -->
    <el-dialog :title="$t('SW_ADD_GROUP')" append-to-body :visible.sync="addGroupDialog">
      <!-- Group name -->
      <el-form label-position="top">
        <el-form>
          <el-form-item required :label="`${$t('SW_GROUP_NAME')}:`">
            <el-input placeholder="The Kangaroos" v-model="newGroupName"></el-input>
          </el-form-item>
        </el-form>

        <el-form-item class="mt-20">
          <el-button type="primary" @click="addNewGroup">
            {{ $t('SW_ADD_GROUP') }}
            <i class="icon-arrow_forward"></i>
          </el-button>
          <el-button type="text" @click="addGroupDialog = false">{{ $t('SW_CANCEL') }}</el-button>
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
      unSorterStudents: [],
      fullStudentsList: [],
      searchText: this.$route.query.query || '',
      isMobile: this.$store.state.isMobile,
      newGroupName: '',
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
    console.log('this is edpack manage groups')
    this.getStudents()
  },

  methods: {
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
