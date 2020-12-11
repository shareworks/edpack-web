<template>
  <div>
    <!-- Animated BG -->
    <animated-landing class="animated"/>
    <el-row type="flex" justify="center" align="middle" class="minimum-page">
      <el-col>
        <div class="public-background"/>

        <!-- Logo -->
        <router-link to="/" :aria-label="$t('SW_LOGO_IMAGE')">
          <div class="horizontal-logo position-relative"/>
        </router-link>

        <!-- Log in panel -->
        <el-alert type="warning" show-icon :closable="false" :title="$t('SW_SERVER_MAINTENANCE', [appName])" v-if="!serverOnline"/>
        <register class="mb-30"/>

        <!-- Footer links -->
        <footer-links class="mt-10"/>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import config from 'config'
import Register from '../../components/Register'
import FooterLinks from '../../components/FooterLinks'
import AnimatedLanding from '../../../components/AnimatedLanding'

export default {
  name: 'Invitation',
  metaInfo: { title: 'Accept invitation' },
  components: { Register, FooterLinks, AnimatedLanding },

  data () {
    return {
      serverOnline: true,
      appName: config.name
    }
  }
}
</script>

<style lang="scss">
    @import '~scss_vars';
    @import './style.scss';
</style>
