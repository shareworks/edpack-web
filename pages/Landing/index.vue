<template>
  <div>
    <animated-landing></animated-landing>
    <el-row type="flex" justify="center" align="middle" class="minimum-page">
      <el-col>
        <div class="public-background"></div>

        <!-- Logo -->
        <a v-if="aboutUrl" :href="aboutUrl" target="_blank"><span class="horizontal-logo"></span></a>
        <router-link v-else to="/about" class="inline"><span class="horizontal-logo"></span></router-link>

        <!-- Text -->
        <p class="landing-text bold font-20">{{ $t('SW_SLOGAN_SHORT') }}</p>

        <!-- Footer links -->
        <footer-links class="mt-10 mb-20 landing-buttons"></footer-links>

        <!-- Log in panel -->
        <login class="mb-30"></login>
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
