<template>
  <div class="inline">
    <el-popover :title="instructors.length > 1 ? school.terminology.instructors[lang] : school.terminology.instructor[lang]" placement="bottom-start">
      <!-- List of instructors -->
      <div v-if="instructors.length" class="mb-10">
        <div v-for="instructor in instructors" class="text-ellipsis mb-5" :key="instructor._id">
          <thumbnail :model="instructor" class="thumb-user thumb-24 mr-5"/>
          <strong>{{instructor.name}}</strong>
          <el-tag class="ml-5" type="info" v-if="evaluation" size="mini">{{ school.terminology.instructor[lang].toLowerCase() }}</el-tag>
        </div>
      </div>
      <div v-else class="text-muted">{{ $t('SW_NO_STAFF_FOUND', [school.terminology.instructors[lang].toLowerCase()]) }}</div>

      <!-- Manage staff -->
      <el-button v-if="canUpdate && !inLTI" type="text" size="small" @click="$emit('manageStaff')">
        <i class="icon-pencil"/>
        {{ $t('SW_MANAGE_STAFF', [school.terminology.instructors[lang].toLowerCase()]) }}
      </el-button>

      <!-- Popover text -->
      <a href="#" @click.prevent slot="reference" class="bold">
        {{ (evaluation ? evaluation.staff.length : course.counts.staff) || 0 }}
        {{ instructors.length > 1 ? school.terminology.instructors[lang] : school.terminology.instructor[lang] }}
      </a>
    </el-popover>
    <span v-if="evaluation"> {{ $t('SW_CAN_ACCESS_RESULTS')}}</span>
  </div>
</template>

<script>
export default {
  name: 'MembersPopover',
  props: ['evaluation', 'canUpdate'],

  data () {
    return {
      course: this.$store.state.course,
      school: this.$store.state.school,
      lang: this.$store.state.lang,
      inLTI: this.$store.state.inLTI,
      instructors: []
    }
  },

  mounted () {
    if (!this.evaluation) this.getInstructors()
    else this.instructors = this.evaluation.staff
  },

  watch: {
    evaluation: {
      deep: true,
      handler () { this.instructors = this.evaluation.staff }
    }
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
