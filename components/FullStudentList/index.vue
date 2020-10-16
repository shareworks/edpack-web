<template>
  <section>
    <!-- Unsorted users -->
    <h3 class="collapse-header block">
      <p class="question-sentence groups-header"><strong>{{ $tc('SW_STUDENT', 2) }}</strong> <el-tag size="mini" class="ml-5">{{ showWithoutGroups ? unSorterStudents.length : filteredStudentList.length }}</el-tag></p>
      <p class="block"><el-checkbox v-model="showWithoutGroups">{{ $t('SW_WITHOUT_GROUP') }}</el-checkbox></p>
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
  props: ['unSorterStudents', 'filteredStudentList', 'dragging', 'setDragging', 'checkIsChanged'],
  data () {
    return {
      showWithoutGroups: false,
    }
  }
}
</script>
