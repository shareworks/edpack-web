<template>
  <div>
    <!-- Animated BG -->
    <animated-landing class="animated"/>
    <el-row type="flex" justify="center" align="middle" class="minimum-page">
      <el-col>
        <!-- Show BG -->
        <div class="public-background"/>

        <!-- Logo -->
        <router-link to="/" :aria-label="$t('SW_LOGO_IMAGE')">
          <div class="horizontal-logo position-relative"/>
        </router-link>

        <!-- Form -->
        <div class="minimum-container">
          <!-- Form title -->
          <div class="title text-center"><strong>{{ $t('SW_RESET_PASSWORD') }}</strong></div>
          <p class="mb-20 text-center">{{ $t('SW_RESET_PASSWORD_TEXT', [appName]) }}</p>

          <!-- Reset Form -->
          <reset-form/>
        </div>

        <!-- Footer links -->
       <footer-links :signin="true"/>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import config from 'config'
import ResetForm from '../../components/ResetForm'
import FooterLinks from '../../components/FooterLinks'
import AnimatedLanding from '../../../components/AnimatedLanding'

export default {
  name: 'Reset',
  metaInfo: { title: 'Reset password' },
  components: { FooterLinks, AnimatedLanding, ResetForm },
  data () {
    return {
      appName: config.name
    }
  }
}
</script>
