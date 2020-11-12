<template>
  <!-- Group name -->
  <el-form label-position="top">
    <el-form-item required :label="`${$t('SW_GROUP_NAME')}:`">
      <el-input placeholder="The Kangaroos" v-model="newGroupName" @keydown.enter.native.prevent="addNewGroup"></el-input>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="addNewGroup">
        {{ $t('SW_ADD_GROUP') }}
        <i class="icon-arrow_forward"></i>
      </el-button>
      <el-button type="text" class="ml-10" @click="closeCreateGroupDialog">{{ $t('SW_CANCEL') }}</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  name: 'CreateGroupItem',
  props: ['closeCreateGroupDialog', 'studentsByGroup'],
  data () {
    return {
      newGroupName: ''
    }
  },
  methods: {
    addNewGroup () {
      const newName = this.newGroupName.trim()
      const group = { name: newName, temporaryGroupName: newName, students: [] }

      if (!newName) return this.$message({ message: this.$i18n.t('SW_GROUP_REQUIRED'), type: 'error' })

      const sameGroupsName = this.studentsByGroup.filter(group => {
        return group.temporaryGroupName.toLowerCase() === newName.toLowerCase()
      })

      if (!sameGroupsName.length) {
        // It's a unique group name
        this.studentsByGroup.push(group)
        this.newGroupName = ''
        this.closeCreateGroupDialog()
        this.$message({ message: this.$i18n.t('SW_ADDED_GROUP'), type: 'success' })
      } else {
        // It's NOT a unique group name
        this.$message({ message: this.$i18n.t('SW_GROUP_NOT_UNIQUE'), type: 'error' })
      }
    },
  }
}
</script>
