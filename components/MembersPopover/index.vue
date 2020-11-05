<template>
  <div class="inline">
    <el-popover :tabindex="0" :title="$tc('SW_STAFF', instructors.length)" placement="bottom-start">
      <!-- List of instructors -->
      <div v-if="instructors.length" class="mb-10">
        <div v-for="instructor in instructors" class="text-ellipsis mb-5" :key="instructor._id">
          <thumbnail :model="instructor" class="thumb-user thumb-24 mr-5"></thumbnail>
          <strong>{{instructor.name}}</strong>
          <el-tag class="ml-5" type="info" v-if="evaluation" size="mini">{{ $tc('SW_' + instructor.role.toUpperCase()) }}</el-tag>
        </div>
      </div>
      <div v-else class="text-muted">{{ $t('SW_NO_STAFF_FOUND') }}</div>

      <!-- Manage -->
      <el-button v-if="canUpdate" type="text" size="small" @click="$emit('manageStaff')">
        <i class="icon-pencil"></i>
        {{ $t('SW_MANAGE_STAFF') }}
      </el-button>

      <!-- Popover text -->
      <el-button type="text" @click.prevent slot="reference" class="bold">
        {{ (evaluation ? evaluation.staff.length : course.counts.staff) || 0 }}
        {{ $tc('SW_STAFF', instructors.length).toLowerCase() }}
      </el-button>
    </el-popover>
    <span v-if="evaluation">{{ $t('SW_CAN_ACCESS_RESULTS')}}</span>
  </div>
</template>

<script>
export default {
  name: 'MembersPopover',
  props: ['evaluation', 'canUpdate'],

  data () {
    return {
      course: this.$store.state.course,
      instructors: []
    }
  },

  mounted () {
    if (!this.evaluation) this.getInstructors()
    else this.instructors = this.evaluation.staff
  },

  watch: {
    evaluation () { this.getInstructors() }
  },

  methods: {
    getInstructors () {
      this.$http.get('users', { params: { role: 'staff', entity: this.course._id } })
        .then((res) => { this.instructors = res.data.list })
        .catch(e => console.log(e))
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
