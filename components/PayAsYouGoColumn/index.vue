<template>
  <div>
    <!-- Open PayAsYouGo dialog -->
    <el-button :type="isOverdue(scope) || !scope.credits || scope.credits.used >= scope.credits.limit ? 'danger' : 'success'" size="mini" @click="openPayAsYouGoDialog(scope)" v-if="scope.role === 'staff'">
            <span v-if="scope.credits.isNew">
              <i class="icon-done_all"/>
              <strong>0</strong>
            </span>
      <span v-else>
              <i class="icon-done_all"/>
              <strong v-if="isOverdue(scope)">0</strong>
              <strong v-else>{{ scope.credits && scope.credits.used > scope.credits.limit ? 0 : scope.credits.limit - scope.credits.used }}</strong>
            </span>
    </el-button>
    <span v-else class="text-muted">-</span>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'PayAsYouGoColumn',
  props: ['scope'],

  methods: {
    isOverdue (user) {
      return user.credits && user.credits.exp && (moment(user.credits.exp) < moment(new Date()))
    },
    openPayAsYouGoDialog (student) {
      this.selectedUser = student
      this.payAsYouGoDialog = true
    }
  }
}
</script>
