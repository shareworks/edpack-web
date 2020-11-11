<template>
  <section>
    <!-- Unsorted users -->
    <h3 class="collapse-header block">
      <p class="question-sentence groups-header"><strong>{{ $tc('SW_STUDENT', 2) }}</strong> <el-tag size="mini" class="ml-5">{{ showWithoutGroups ? unSorterStudents.length : filteredStudentList.length }}</el-tag></p>
      <p class="block mb-10 mt-10 ml-10 font-13"><el-checkbox v-model="showWithoutGroups">{{ $t('SW_WITHOUT_GROUP') }}</el-checkbox></p>
    </h3>
    <!-- Draggable unsorted students group list -->
    <groups-item class="unsorted-list" :class="{'can-drag-in': dragging && showWithoutGroups}" :totalStudentsList="!showWithoutGroups" :setDragging="setDragging" :checkIsChanged="checkIsChanged" :students="showWithoutGroups ? unSorterStudents : filteredStudentList"></groups-item>
  </section>
</template>
<script>
import GroupsItem from '../GroupsItem'

export default {
  name: 'FullStudentList',
  components: { GroupsItem },
  props: ['unSorterStudents', 'checkIsChanged', 'allStudents', 'studentsWithGroups', 'dragging', 'setDragging'],
  data () {
    return {
      showWithoutGroups: false,
      filteredStudentList: []
    }
  },

  watch: {
    studentsWithGroups () { setTimeout(() => { this.setFilteredStudentsList(this.allStudents) }, 0) },
    unSorterStudents () { setTimeout(() => { this.setFilteredStudentsList(this.allStudents) }, 0) }
  },

  methods: {
    setFilteredStudentsList (students) {
      this.filteredStudentList = []

      students.forEach(student => {
        const studentAlreadyExist = this.filteredStudentList.find(stud => { return stud._id === student._id })

        if (!studentAlreadyExist || !student._id) {
          const updateStudent = { ...student }
          delete updateStudent.group
          updateStudent.groupName = ''
          updateStudent.groupCount = 0

          this.filteredStudentList.push(updateStudent)
        }
      })

      this.updateStudentGroupsAmount()
    },

    updateStudentGroupsAmount () {
      const flattedStudentsWithGroups = this.studentsWithGroups.flat(2)
      this.filteredStudentList.forEach(stud => {
        const takeParticipantsInGroups = flattedStudentsWithGroups.filter(st => { return stud._id === st._id })
        stud.groupCount = takeParticipantsInGroups.length
      })
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import 'style';
</style>
