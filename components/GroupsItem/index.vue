<template>
  <section>
    <draggable ghost-class="ghost" class="group-students" :list="students" :disabled="manipulationDisabled"
               @start="setDragging(true, mode === 'all')" @end="onEnd" :sort="false" @change="changeStudentGroup($event, students)"
               :group="mode === 'all' ? {name: 'students', pull: 'clone', put: false} : {name: 'students', pull: true, put: true }">

      <!-- Student card -->
      <el-card v-for="(student, index) in students" v-show="!searchText || student.name.includes(searchText)" class="student-card-item" :key="student._id + '_' + index">
        <!-- Drag handle -->
        <el-button class="button-drag mr-5 ml-5" size="small" v-if="!manipulationDisabled" type="text">
          <i class="icon-drag_handle"/>
        </el-button>

        <!-- Student thumbnail -->
        <div class="inline">
          <thumbnail :model="student" class="thumb-user mr-10 hidden-xs thumb-24 thumbnail"/>
        </div>

        <!-- Student name -->
        <p class="student-name text-ellipsis">{{ student.name ? student.name : student.email }}</p>

        <!-- Amount of groups -->
        <el-tag v-if="mode === 'all'" class="group-amount-tag text-muted hidden-xs" size="small" type="info">
          <span class="ml-5">{{ student.groupCount || 0 }} <i class="icon-peers"/></span>
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
  props: ['students', 'setDragging', 'mode', 'group', 'searchText', 'changeStudentGroup', 'manipulationDisabled'],

  data () {
    return {
      school: this.$store.state.school,
      lang: this.$store.state.user.language
    }
  },

  methods: {
    onEnd (draggableEvent) {
      this.setDragging(false, this.mode === 'all')
      // Drag to same element
      if (draggableEvent.to === draggableEvent.from) {
        return
      }
      // Drag to delete zone should show any message
      if (draggableEvent.to.className === 'remove-students') {
        return
      }

      const message = this.$i18n.t(draggableEvent.pullMode === 'clone' ? 'SW_USER_COPIED' : 'SW_USER_MOVED', [this.school.terminology.student[this.lang]])
      this.$message({ message, type: 'success' })
      this.$emit('updateGroupCount', true)
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import 'style.scss';
</style>
