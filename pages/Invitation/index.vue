<template>
  <div>
    <animated-landing class="animated"></animated-landing>
    <el-row type="flex" justify="center" align="middle" class="minimum-page">
      <el-col>
        <div class="public-background"></div>

        <!-- Logo -->
        <div class="horizontal-logo"></div>

        <!-- Log in panel -->
        <el-alert type="warning" show-icon :closable="false" :title="$t('SW_SERVER_MAINTENANCE', [appName])" v-if="!serverOnline"></el-alert>
        <register class="mb-30"></register>

        <!-- Footer links -->
        <footer-links class="mt-10"></footer-links>
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
  },

  mounted () {
    this.checkConnection()
  },

  methods: {
    checkConnection () {
      this.$http.get('status')
        .then(() => { this.serverOnline = true })
        .catch(() => { this.serverOnline = false })
    }
  }
}
</script>

<style lang="scss">
    @import '~scss_vars';
    @import './style.scss';
</style>
