<template>
  <div>
    <div v-for="notification in notificationRoles" :key="notification.type">
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
      school: this.$store.state.school,
      lang: this.$store.state.lang,
      notificationRoles: config.notificationRoles
    }
  },
  methods: {
    translateRoles (rolesList) {
      return rolesList.map(role => ' ' + this.getLabelText(role))
    },
    getLabelText (role) {
      if (role === 'student') return this.school.terminology.student[this.lang]
      else if (role === 'staff') return this.school.terminology.instructor[this.lang]
      else if (role === 'admin') return this.$i18n.tc('SW_ADMIN', 1)
    }
  }
}
</script>
