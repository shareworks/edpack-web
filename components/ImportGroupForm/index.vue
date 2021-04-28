<template>
  <div>
    <!-- Select groups or group sets -->
    <el-form-item :label="$t('SW_USER_IMPORT_SOURCE')" v-if="course.lmsApiIntegration && lms === 'blackboard'">
      <el-radio-group :disabled="disabledEdit" v-model="form.lmsImportType" size="small" @change="handleImportType">
        <el-radio-button label="groupSets">{{ $t('SW_GROUP_SETS') }}</el-radio-button>
        <el-radio-button label="groups">{{ $t('SW_GROUPS') }}</el-radio-button>
      </el-radio-group>
      <span class="ml-10 text-muted hidden-xs">{{ $t('SW_SELECT_GROUP_IMPORT_TYPE') }}</span>
    </el-form-item>

    <!-- Select groups from Blackboard -->
    <div v-if="course.lmsApiIntegration && lms === 'blackboard' && form.lmsImportType === 'groups'" class="mb-20">
      <el-form-item v-if="lmsGroups.length && form[lms].groupCategories" :label="$t('SW_GROUPS')" required>
        <p class="form-help-text">{{$t('SW_AVAILABLE_GROUPS_TEXT')}}</p>
        <el-checkbox-group :disabled="disabledEdit" v-model="form[lms].groupCategories">
          <div v-for="(group, index) in lmsGroups" :key="index">
            <el-checkbox class="text-ellipsis" :label="group" :key="group.blackboardId">
              {{ group.name }}
              <el-tag size="mini" class="ml-5 no-bold" v-if="group.membersCount && !disabledEdit">
                {{ group.membersCount }} {{ $tc('SW_STUDENT', group.membersCount).toLowerCase() }}
              </el-tag>
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </el-form-item>
      <el-alert class="mt-5" type="warning" v-if="!loading && !lmsGroups.length" :title="$t('SW_NO_GROUPS_INDIVIDUAL')"/>
    </div>

    <!-- Group categories -->
    <div v-else-if="course.lmsApiIntegration" class="mb-20">
      <el-form-item :label="$t('SW_AVAILABLE_GROUPS')" required>
        <p class="form-help-text">
          {{$t('SW_AVAILABLE_GROUP_SETS_TEXT')}}
          <el-popover placement="top-start" width="400" trigger="click" :content="$t('SW_USER_IMPORT_SOURCE_HELP')">
            <a class="cursor-pointer" slot="reference"><i class="icon-question question-circle question-pop ml-5"/></a>
          </el-popover>
        </p>
        <el-checkbox-group :disabled="disabledEdit" v-model="form[lms].groupCategories" v-if="lmsGroupSets.length && form[lms].groupCategories">
          <div v-for="(group, index) in lmsGroupSets" :key="index">
            <el-checkbox class="text-ellipsis" :label="group" :key="group.canvasId || group.brightspaceId || group.blackboardId">
              <span v-if="lms !== 'blackboard' || !group.groupNames">
                {{ group.name }}
                <el-tag size="mini" class="ml-5 no-bold" v-if="group.membersCount && !disabledEdit">
                  {{ group.membersCount }} {{ $tc('SW_STUDENT', group.membersCount).toLowerCase() }}
                </el-tag>
              </span>
              <span v-else>
                <span>{{ group.name }} (</span>
                <i class="icon-users"/>
                <span>{{ (group.groupNames.length || 0) + ' groups | Blackboard id:' }}</span>
                <span> {{ group.blackboardId }})</span>
                <el-tag size="mini" class="ml-5 no-bold" v-if="group.membersCount && !disabledEdit">
                  {{ group.membersCount }} {{ $tc('SW_STUDENT', group.membersCount).toLowerCase() }}
                </el-tag>
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
  props: ['form', 'loading'],

  data () {
    return {
      lms: getLmsType(this.$store.state.course),
      course: this.$store.state.course,
      disabledEdit: !this.form.isNew,
      lmsGroupSets: [],
      lmsGroups: []
    }
  },

  mounted () {
    // Get different group sets/categories
    if (this.course.lmsApiIntegration && this.form.isNew) return this.getLMSGroupSets(this.lms)

    // In case something is wrong, stop here
    if (!this.form[this.lms].groupCategories) return

    // In edit mode, just show selected group categories
    this.lmsGroupSets = this.form.lmsImportType === 'groupSets' ? this.form[this.lms].groupCategories : []
    this.lmsGroups = this.form.lmsImportType === 'groups' ? this.form[this.lms].groupCategories : []
  },

  methods: {
    getLMSGroupSets (lms) {
      this.$emit('setLoading', true)

      this.$http.get(`courses/${this.course._id}/${lms}/group-categories`, { params: { includeGroups: true } })
        .then((res) => {
          this.lmsGroupSets = this.lms === 'blackboard' ? res.data.list.filter(el => el.isGroupCategory) : res.data.list
          this.lmsGroups = this.lms === 'blackboard' ? res.data.list.filter(el => !el.isGroupCategory && !el.categoryId) : []
          this.handleImportType()
        })
        .finally(() => { this.$emit('setLoading', false) })
    },
    handleImportType () {
      this.form[this.lms].groupCategories = []
      if (this.form.lmsImportType === 'groupSets' && (this.lmsGroupSets.length === 1)) this.form[this.lms].groupCategories = this.lmsGroupSets
      if (this.form.lmsImportType === 'groups' && (this.lmsGroups.length === 1)) this.form[this.lms].groupCategories = this.lmsGroups
    }
  }
}
</script>
