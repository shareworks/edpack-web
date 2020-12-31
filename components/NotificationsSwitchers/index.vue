<template>
  <div>
    <div v-for="notification in notificationRoles">
      <el-switch v-model="form.checks[notification.type]" active-color="#ff4949" inactive-color="#13ce66"/>
      <strong class="ml-10">{{ $t('SW_SEE_DISABLE_AS', [translateRoles(notification.role)]) }}</strong>
      &centerdot;
      <span>{{ $t(`SW_${notification.type.toUpperCase()}`) }}</span>
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
