<template>
  <div class="inline">
    <el-popover :title="$t('SW_STAFF_MEMBERS')" placement="bottom-start">
      <!-- List of instructors -->
      <div v-if="instructors.length" class="mb-10">
        <div v-for="instructor in instructors" class="text-ellipsis mb-5" :key="instructor._id">
          <thumbnail :model="instructor" class="thumb-user thumb-24 mr-5"></thumbnail>
          <strong>{{instructor.name}}</strong>
          <el-tag class="ml-5" type="info" v-if="evaluation" size="mini">{{ $t('SW_' + instructor.role.toUpperCase()) }}</el-tag>
        </div>
      </div>
      <div v-else class="text-muted">{{ $t('SW_NO_STAFF_FOUND') }}</div>

      <!-- Manage -->
      <el-button v-if="evaluation && evaluation.can.update" type="text" size="small" @click="$emit('manageStaff')">
        <i class="icon-pencil"></i>
        {{ $t('SW_MANAGE_STAFF') }}
      </el-button>

      <!-- Popover text -->
      <a href="#" @click="preventDefault" slot="reference" class="bold">
        {{ evaluation ? evaluation.staff.length : course.counts.staff || 0 }}
        {{ $t('SW_STAFF_MEMBERS').toLowerCase() }}
      </a>
    </el-popover>
    <span v-if="evaluation">{{ $t('SW_CAN_ACCESS_RESULTS')}}</span>
  </div>
</template>

<script>
export default {
  props: ['evaluation'],
  name: 'MembersPopover',

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

  methods: {
    getInstructors () {
      this.$http.get('users', { params: { role: 'staff', entity: this.course._id } })
        .then((res) => { this.instructors = res.data.list })
        .catch(() => {})
    },
    preventDefault (e) { e.preventDefault() }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
