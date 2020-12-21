<template>
  <div>
    <!-- Disable Staff Notification -->
    <el-form-item v-if="showDisableStaffNotification && form.checks && showFullAccountInfo && (form.role === 'staff' || isAdmin)" :label="$t('SW_STAFF_NOTIFICATION_DISABLING')">
      <el-switch v-model="form.checks.disableStaffNotifcation" active-color="#13ce66" inactive-color="#ff4949"/>
      <span class="text-muted ml-10">{{ $t('SW_STAFF_NOTIFICATION_TEXT') }}</span>
    </el-form-item>

    <!-- Disable Start Notification -->
    <el-form-item v-if="showDisableStartNotification && form.checks && showFullAccountInfo" :label="$t('SW_STARTED_EVALUATION_NOTIFICATION_DISABLING')">
      <el-switch v-model="form.checks.disableStartNotification" active-color="#13ce66" inactive-color="#ff4949"/>
      <span class="text-muted ml-10">{{ $t('SW_STARTED_EVALUATION_NOTIFICATION_TEXT') }}</span>
    </el-form-item>

    <!-- Disable Closed Notification -->
    <el-form-item v-if="showDisableClosedNotification && form.checks && showFullAccountInfo" :label="$t('SW_CLOSED_EVALUATION_NOTIFICATION_DISABLING')">
      <el-switch v-model="form.checks.disableClosedNotification" active-color="#13ce66" inactive-color="#ff4949"/>
      <span class="text-muted ml-10">{{ $t('SW_CLOSED_EVALUATION_NOTIFICATION_TEXT') }}</span>
    </el-form-item>

    <!-- Disable Pending Notification -->
    <el-form-item v-if="showDisablePendingNotification && form.checks && showFullAccountInfo" :label="$t('SW_PENDING_NOTIFICATION_DISABLING')">
      <el-switch v-model="form.checks.disablePendingNotification" active-color="#13ce66" inactive-color="#ff4949"/>
      <span class="text-muted ml-10">{{ $t('SW_PENDING_NOTIFICATION_DISABLING_TEXT') }}</span>
    </el-form-item>

    <!-- Disable Released Notification -->
    <el-form-item v-if="showDisableReleasedNotification && form.checks && showFullAccountInfo" :label="$t('SW_RELEASED_NOTIFICATION_DISABLING')">
      <el-switch v-model="form.checks.disableReleasedNotification" active-color="#13ce66" inactive-color="#ff4949"/>
      <span class="text-muted ml-10">{{ $t('SW_RELEASED_NOTIFICATION_DISABLING_TEXT') }}</span>
    </el-form-item>

    <!-- Disable Released-Locked Notification -->
    <el-form-item v-if="showDisableReleasedLockedNotification && form.checks && showFullAccountInfo" :label="$t('SW_RELEASED_LOCKED_NOTIFICATION_DISABLING')">
      <el-switch v-model="form.checks.disableReleasedLockedNotification" active-color="#13ce66" inactive-color="#ff4949"/>
      <span class="text-muted ml-10">{{ $t('SW_RELEASED_LOCKED_NOTIFICATION_DISABLING_TEXT') }}</span>
    </el-form-item>
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
