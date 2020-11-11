<template>
  <section>
    <draggable ghost-class="ghost" class="group-students" :list="students"
               :group="mode === 'all' ? {name: 'students', pull: 'clone', put: false} : {name: 'students', pull: true, put: true }"
               @start="setDragging(true)" @end="onEnd" :sort="false" @change="changeStudentGroup">

      <el-card v-for="(student, index) in students" class="student-card-item" :key="student._id + '_' + index">
        <!-- Drag handle -->
        <el-button class="button-drag" type="text">
          <i class="icon-drag_handle"></i>
        </el-button>

        <!-- Student avatar -->
        <div class="inline">
          <thumbnail :model="student" class="thumb-user mr-10 hidden-xs thumb-24 thumbnail"></thumbnail>
        </div>

        <!-- Student name -->
        <p class="student-name text-ellipsis">{{ student.name ? student.name : student.email }}</p>

        <!-- Amount of groups -->
        <el-tag v-if="mode === 'all'" class="group-amount-tag text-muted hidden-sm hidden-xs" size="small" type="info">
          {{ student.groupCount || 0 }} {{ $tc('SW_GROUP', student.groupCount || 0).toLowerCase() }}
        </el-tag>
      </el-card>
    </draggable>
  </section>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  name: 'GroupsItem',
  components: { draggable },
  props: ['students', 'setDragging', 'mode', 'group'],

  methods: {
    onEnd (draggableEvent) {
      this.setDragging(false)
      // Drag to same element
      if (draggableEvent.to === draggableEvent.from) {
        return
      }
      // Drag to delete zone should show any message
      if (draggableEvent.to.className === 'remove-students') {
        return
      }

      const message = draggableEvent.pullMode === 'clone' ? this.$i18n.t('SW_USER_COPIED') : this.$i18n.t('SW_USER_MOVED')
      this.$message({ message, type: 'success' })

      if (draggableEvent.pullMode === 'clone') {
        this.$emit('updateGroupCount')
      }
    },
    changeStudentGroup (action) {
      if (action.added) {
        // @TODO make simpler to prevent duplicate students
        const sameStudentsInGroup = this.students.filter(stud => { return stud._id === action.added.element._id })
        if (sameStudentsInGroup.length > 1) {
          const removeStudentIndex = this.students.findIndex(stud => { return stud._id === action.added.element._id })
          this.students.splice(removeStudentIndex, 1)
        }
        action.added.element.groupName = this.group.name
        action.added.element.group = this.group
      }
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import 'style';
</style>
