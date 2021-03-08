<template>
  <div>
    <!-- Select groups or group sets -->
    <el-form-item :label="$t('SW_SELECT')" v-if="form.isNew && course.lmsApiIntegration && lms === 'blackboard'">
      <el-radio-group v-model="form.lmsImportType" size="small" @change="cleanSelectedGroupCategories">
        <el-radio-button label="groupSets">{{ $t('SW_GROUP_SETS') }}</el-radio-button>
        <el-radio-button label="groups">{{ $t('SW_GROUPS') }}</el-radio-button>
      </el-radio-group>
      <span class="ml-10 text-muted hidden-xs">{{ $t('SW_SELECT_GROUP_IMPORT_TYPE') }}</span>
    </el-form-item>

    <!-- Select groups from Blackboard -->
    <div v-if="form.isNew && course.lmsApiIntegration && lms === 'blackboard' && form.lmsImportType === 'groups'" class="mb-20">
      <el-form-item v-if="lmsGroups.length && (form.isNew || form.groupCategories)" :label="$t('SW_GROUPS')" required>
        <p class="form-help-text">{{$t('SW_AVAILABLE_GROUPS_TEXT')}}</p>
        <el-checkbox-group v-model="form.groupCategories">
          <div v-for="(group, index) in lmsGroups" :key="index">
            <el-checkbox :disabled="!form.isNew" class="text-ellipsis" :label="group" :key="group.blackboardId">
              {{ group.name }}
            </el-checkbox>
          </div>
        </el-checkbox-group>
        <el-alert class="mt-5" type="warning" v-if="!loading && !lmsGroups.length" :title="$t('SW_NO_GROUPS_INDIVIDUAL')"/>
      </el-form-item>
    </div>

    <!-- Group categories -->
    <div v-else-if="form.isNew && course.lmsApiIntegration" class="mb-20">
      <el-form-item :label="$t('SW_AVAILABLE_GROUPS')" required>
        <p class="form-help-text">{{$t('SW_AVAILABLE_GROUP_SETS_TEXT')}}</p>
        <el-checkbox-group v-model="form.groupCategories" v-if="lmsGroupSets.length && (form.isNew || form.groupCategories)">
          <div v-for="(group, index) in lmsGroupSets" :key="index">
            <el-checkbox :disabled="!form.isNew" class="text-ellipsis" :label="group" :key="group.canvasId || group.brightspaceId || group.blackboardId">
              <span v-if="lms !== 'blackboard' || !group.groupNames"> {{ group.name }} </span>
              <span v-else>
                <span>{{group.name}} (</span>
                <i class="icon-users"/>
                <span>{{(group.groupNames.length || 0) + ' groups | Blackboard id:' }}</span>
                <span> {{group.blackboardId}})</span>
              </span>
            </el-checkbox>
          </div>
        </el-checkbox-group>
        <el-alert class="mt-5" type="warning" v-if="!loading && !lmsGroupSets.length" :title="$t('SW_NO_GROUP_CATEGORIES')"/>
      </el-form-item>
    </div>
  </div>
</template>

<script>
import getLmsType from '@/edpack-web/utils/get-lms-type'

export default {
  name: 'ImportGroupForm',
  props: ['form'],

  data () {
    return {
      lms: getLmsType(this.$store.state.course),
      course: this.$store.state.course,
      lmsGroupSets: [],
      lmsGroups: [],
    }
  },

  mounted() {
    // Get different group sets/categories
    if (this.form.isNew && this.course.lmsApiIntegration) this.getLMSGroupSets(this.lms)
  },

  methods: {
    getLMSGroupSets (lms) {
      this.$emit('setLoading', true)

      this.$http.get(`courses/${this.course._id}/${lms}/group-categories`)
        .then((res) => {
          this.lmsGroupSets = this.lms === 'blackboard' ? res.data.list.filter(el => el.isGroupCategory) : res.data.list
          this.lmsGroups = this.lms === 'blackboard' ? res.data.list.filter(el => !el.isGroupCategory && !el.categoryId) : []

          this.cleanSelectedGroupCategories()
        })
        .finally(() => { this.$emit('setLoading', false) })
    },
    cleanSelectedGroupCategories () {
      this.form.groupCategories = []
      if (this.lmsGroupSets.length === 1 && this.form.lmsImportType === 'groupSets') this.form.groupCategories = this.lmsGroupSets
      if (this.lmsGroups.length === 1 && this.form.lmsImportType === 'groups') this.form.groupCategories = this.lmsGroups
    },
  }
}
</script>
