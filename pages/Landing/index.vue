<template>
  <div>
    <!-- Animated BG -->
    <animated-landing/>
    <el-row type="flex" justify="center" align="top" class="minimum-page landing-wrapper">
    <el-col>
        <div class="public-background"/>

        <!-- Logo -->
        <a v-if="aboutUrl" :href="aboutUrl" :aria-label="$t('SW_LOGO_IMAGE')" target="_blank">
          <span class="horizontal-logo"/>
        </a>

        <router-link v-else to="/about" class="inline" :aria-label="$t('SW_LOGO_IMAGE')">
          <span class="horizontal-logo"/>
        </router-link>

        <!-- Text -->
        <p class="landing-text bold font-20">{{ $t('SW_SLOGAN_SHORT') }}</p>

        <!-- Footer links -->
        <footer-links class="mt-10 mb-20 landing-buttons"/>

        <!-- Log in panel -->
        <login class="mb-30"/>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import config from 'config'
import Login from '../../components/Login'
import FooterLinks from '../../components/FooterLinks'
import AnimatedLanding from '../../../components/AnimatedLanding'

export default {
  name: 'Landing',
  metaInfo: { title: 'Sign in' },
  components: { Login, FooterLinks, AnimatedLanding },
  data () {
    return {
      aboutUrl: config.aboutUrl
    }
  }
}
</script>

<style lang="scss">
    @import '~scss_vars';
    @import './style.scss';
</style>
