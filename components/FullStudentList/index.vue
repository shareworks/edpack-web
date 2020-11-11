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
    <groups-item :class="{'can-drag-in': dragging && noGroup}" :mode="noGroup ? 'without' : 'all'" :setDragging="setDragging" :students="noGroup ? studentsWithoutGroup : studentsSorted "></groups-item>
  </section>
</template>
<script>
import GroupsItem from '../GroupsItem'

export default {
  name: 'FullStudentList',
  components: { GroupsItem },
  props: ['allStudents', 'dragging', 'setDragging'],
  data () {
    return {
      noGroup: false,
      studentsSorted: [],
      studentsWithoutGroup: this.allStudents.filter(user => !user.groupName || user.groupName === '' || !user.group)
    }
  },

  mounted () {
    this.sortStudents()
  },

  methods: {
    sortStudents () {
      const studentsSorted = []

      this.allStudents.forEach(user => {
        if (!user.groupName) return studentsSorted.push(user)

        const studentIndex = studentsSorted.findIndex(student => student._id === user._id)
        if (studentIndex > -1) return studentsSorted[studentIndex].groupCount++
        user.groupCount = 1
        studentsSorted.push(user)
      })

      this.studentsSorted = studentsSorted
    }
  }
}
</script>

