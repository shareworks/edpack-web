<template>
  <div>
    <animated-landing class="animated"></animated-landing>
    <el-row type="flex" justify="center" align="middle" class="minimum-page">
      <el-col>
        <!-- Show BG -->
        <div class="public-background"></div>

        <!-- Logo -->
        <router-link to="/" :aria-label="$t('SW_LOGO_IMAGE')">
          <div class="horizontal-logo position-relative"></div>
        </router-link>

        <div class="minimum-container">
          <h3>{{ $t('SW_NOTIFICATION_DISABLED', [notificationType]) }}</h3>
          <p>{{ $t('SW_NOTIFICATION_DISABLED_TEXT') }}</p>
        </div>

        <!-- Footer links -->
        <footer-links :signin="true"/>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import FooterLinks from '../../components/FooterLinks'
import AnimatedLanding from '../../../components/AnimatedLanding'

export default {
  name: 'Notifications',
  metaInfo: { title: 'Disable notification' },
  components: { FooterLinks, AnimatedLanding },
  computed: {
    notificationType () {
      const type = this.$route.query.type
      return this.$i18n.t(`SW_${type.toUpperCase()}`)
    }
  }
}
</script>
