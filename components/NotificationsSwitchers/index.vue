<template>
  <div>
    <!-- Disable Staff Notification -->
    <div v-if="showDisableStaffNotification && (form.role === 'staff' || isAdmin)">
      <el-switch v-model="form.checks.disableStaffNotifcation" active-color="#13ce66" inactive-color="#ff4949"/>
      <span class="text-muted ml-10">{{ $t('SW_STAFF_NOTIFICATION_TEXT') }}</span>
    </div>

    <!-- Disable Start Notification -->
    <div v-if="showDisableStartNotification">
      <el-switch v-model="form.checks.disableStartNotification" active-color="#13ce66" inactive-color="#ff4949"/>
      <span class="text-muted ml-10">{{ $t('SW_STARTED_EVALUATION_NOTIFICATION_TEXT') }}</span>
    </div>

    <!-- Disable Closed Notification -->
    <div v-if="showDisableClosedNotification">
      <el-switch v-model="form.checks.disableClosedNotification" active-color="#13ce66" inactive-color="#ff4949"/>
      <span class="text-muted ml-10">{{ $t('SW_CLOSED_EVALUATION_NOTIFICATION_TEXT') }}</span>
    </div>

    <!-- Disable Pending Notification -->
    <div v-if="showDisablePendingNotification">
      <el-switch v-model="form.checks.disablePendingNotification" active-color="#13ce66" inactive-color="#ff4949"/>
      <span class="text-muted ml-10">{{ $t('SW_PENDING_NOTIFICATION_DISABLING_TEXT') }}</span>
    </div>

    <!-- Disable Released Notification -->
    <div v-if="showDisableReleasedNotification">
      <el-switch v-model="form.checks.disableReleasedNotification" active-color="#13ce66" inactive-color="#ff4949"/>
      <span class="text-muted ml-10">{{ $t('SW_RELEASED_NOTIFICATION_DISABLING_TEXT') }}</span>
    </div>

    <!-- Disable Released-Locked Notification -->
    <div v-if="showDisableReleasedLockedNotification">
      <el-switch v-model="form.checks.disableReleasedLockedNotification" active-color="#13ce66" inactive-color="#ff4949"/>
      <span class="text-muted ml-10">{{ $t('SW_RELEASED_LOCKED_NOTIFICATION_DISABLING_TEXT') }}</span>
    </div>
  </div>
</template>
<script>
import config from 'config'

export default {
  name: 'NotificationsSwitchers',
  props: ['form', 'showFullAccountInfo'],
  data () {
    return {
      isAdmin: this.$store.state.isAdmin,
      showDisableStaffNotification: config.showDisableStaffNotification,
      showDisableStartNotification: config.showDisableStartNotification,
      showDisableClosedNotification: config.showDisableClosedNotification,
      showDisablePendingNotification: config.showDisablePendingNotification,
      showDisableReleasedNotification: config.showDisableReleasedNotification,
      showDisableReleasedLockedNotification: config.showDisableReleasedLockedNotification,

    }
  }
}
</script>
