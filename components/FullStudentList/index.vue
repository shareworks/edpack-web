<template>
  <section class="mb-5 mt-5 unsorted-row">
    <h3 class="collapse-header block">
      <!-- Amount of students -->
      <p class="question-sentence groups-header">
        <strong>{{ school.terminology.students[lang] }}</strong>
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
                 :class="{'can-drag-in': dragging && noGroup}" :mode="noGroup ? 'without' : 'all'" :changeStudentGroup="changeStudentGroup"
                 :students="noGroup ? studentsWithoutGroup : studentsSorted" :searchText="searchText" :manipulationDisabled="manipulationDisabled"/>
  </section>
</template>
<script>
import debounce from 'lodash/debounce'
import GroupsItem from '../GroupsItem'

export default {
  name: 'FullStudentList',
  components: { GroupsItem },
  props: ['allStudents', 'dragging', 'setDragging', 'changeStudentGroup', 'updateGroupCount', 'setStudentsWithoutGroup', 'studentsWithoutGroup', 'searchText', 'manipulationDisabled'],
  data () {
    return {
      noGroup: false,
      studentsSorted: [],
      lang: this.$store.state.lang,
      school: this.$store.state.school
    }
  },

  watch: {
    allStudents: {
      immediate: true,
      handler: debounce(function () { this.sortStudents() }, 400)
    }
  },

  methods: {
    sortStudents () {
      const studentsSorted = []
      const studentsWithoutGroup = []

      this.allStudents.forEach(student => {
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
