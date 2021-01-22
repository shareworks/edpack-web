<template>
  <section class="mb-5 mt-5 unsorted-row">
    <h3 class="collapse-header block">
      <!-- Amount of students -->
      <p class="question-sentence groups-header">
        <strong>{{ $tc('SW_STUDENT', 2) }}</strong>
        <el-tag size="mini" class="ml-5">{{ noGroup ? studentsWithoutGroup.length : studentsSorted.length }}
      </el-tag>
      </p>

      <!-- Without group -->
      <p class="block mb-10 mt-10 ml-10 font-13">
        <el-checkbox v-model="noGroup">{{ $t('SW_WITHOUT_GROUP') }}</el-checkbox>
      </p>
    </h3>

    <!-- Draggable students list -->
    <groups-item @updateGroupCount="updateGroupCount" class="students-list-padding"  :setDragging="setDragging"
                 :class="{'can-drag-in': dragging && noGroup}" :mode="noGroup ? 'without' : 'all'"
                 :students="noGroup ? studentsWithoutGroup : studentsSorted"/>
  </section>
</template>
<script>
import GroupsItem from '../GroupsItem'
import debounce from 'lodash/debounce'

export default {
  name: 'FullStudentList',
  components: { GroupsItem },
  props: ['allStudents', 'dragging', 'setDragging', 'updateGroupCount', 'setStudentsWithoutGroup', 'studentsWithoutGroup', 'searchText'],
  data () {
    return {
      noGroup: false,
      studentsSorted: []
    }
  },

  watch: {
    allStudents: {
      immediate: true,
      handler: debounce(function () { this.sortStudents() }, 400)
    },
    searchText: {
      handler: debounce(function () { this.sortStudents() }, 400)
    }
  },

  updated () {
    console.log('FullStudentList updated')
  },

  methods: {
    sortStudents () {
      const studentsSorted = []
      const studentsWithoutGroup = []
      const trimmedSearch = this.searchText.trim()

      this.allStudents.forEach(student => {
        if (trimmedSearch && !student.name.includes(trimmedSearch)) return

        const studentAlreadyAdded = studentsSorted.find(stud => stud._id === student._id)
        // Prevent adding same student to the list
        if (studentAlreadyAdded) return

        if (student.groupCount === 0) {
          student.groupName = null
          student.group = null
          studentsWithoutGroup.push(student)
        }

        studentsSorted.push(student)
      })

      this.studentsSorted = studentsSorted
      this.setStudentsWithoutGroup(studentsWithoutGroup)
    }
  }
}
</script>
