<template>
  <div>
    <div v-for="notification in notificationRoles">
      <el-switch v-model="form.checks[notification.type]" active-color="#13ce66" inactive-color="#ff4949"/>
      <span class="text-faded ml-10">({{ $t('SW_SEE_DISABLE_AS', [translateRoles(notification.role)]) }})</span>
      <span class="text-muted ml-10">{{ $t(`SW_${notification.type.toUpperCase()}`) }}</span>
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
      notificationRoles: config.notificationRoles
    }
  },
  methods: {
    translateRoles (rolesList) {
      return rolesList.map(role => ' ' + this.$i18n.tc(`SW_${role.toUpperCase()}`, 1).toLowerCase())
    }
  }
}
</script>
