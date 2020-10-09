<template>
  <section>
    <!-- be careful when editing styles names - they used in js code - canDragUserInside function -->
    <draggable ghost-class="ghost" :move="canDragUserInside" class="group-students" :class="{ totalStudentsList }" :list="students" group="students" @start="setDragging(true)" @end="onEnd" @change="changeStudentGroup($event, students.groupName)">
      <el-card v-for="student in students" class="student-card-item" :key="student._id">
        <el-button class="button-drag" type="text">
          <i class="icon-drag_handle"></i>
        </el-button>
        <div class="inline">
          <thumbnail :model="student" class="thumb-user mr-10 hidden-xs thumb-24 thumbnail"></thumbnail>
        </div>
        <p class="student-name text-ellipsis">{{ student.name ? student.name : student.email | truncate(50)}}</p>
      </el-card>
    </draggable>
  </section>
</template>

<script>
import draggable from 'vuedraggable'
export default {
  name: 'GroupsItem',
  components: { draggable },
  props: ['students', 'checkIsChanged', 'setDragging', 'totalStudentsList'],

  methods: {
    onEnd (draggableEvent) {
      this.setDragging(false)

      if (draggableEvent.to === draggableEvent.from) {
        return
      }

      if (draggableEvent.to.className === 'remove-students') {
        return
      }

      if (draggableEvent.from.className === 'group-students totalStudentsList') {
        this.$message({ message: this.$i18n.t('SW_USER_COPIED'), type: 'success' })
      } else {
        this.$message({ message: this.$i18n.t('SW_USER_MOVED'), type: 'success' })
      }
    },
    canDragUserInside (draggableEvent) {
      return draggableEvent.to.className !== 'group-students totalStudentsList'
    },
    returnUserToGroup (action) {
      this.students.splice(action.removed.oldIndex, 0, action.removed.element)
    },
    changeStudentGroup (action, groupName) {
      if (this.totalStudentsList && action.removed) {
        // when copy user - return original to the list on the same position
        this.returnUserToGroup(action)
      }

      if (action.added) {
        if (!groupName) {
          delete action.added.element.group
        }

        action.added.element.groupName = groupName
        this.checkIsChanged()
      }
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import 'style';
</style>
