<template>
  <el-row type="flex" justify="center" align="middle" class="minimum-page">
    <el-col>
      <div class="public-background"></div>

      <!-- Logo -->
      <a v-if="aboutUrl" class="inline" :href="aboutUrl" target="_blank"><span class="horizontal-logo"></span></a>
      <router-link v-else to="/about" class="inline"><span class="horizontal-logo"></span></router-link>

      <!-- Text -->
      <p class="contact-title bold font-20 mb-30">{{ $t('SW_CONTACT_US') }}</p>

      <!-- Contact form -->
      <div class="contact-form-wrapper invisible text-left" v-observe-visibility="{callback: visibilityChanged, throttle: 200, once: true}">
        <el-alert class="mb-20" type="warning" show-icon :closable="false" :title="$t('SW_SERVER_MAINTENANCE')" v-if="!serverOnline"></el-alert>
        <contact-form></contact-form>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import config from 'config'
export default {
  name: 'contact-us',
  metaInfo: {
    title: 'Contact us'
  },
  components: { ContactForm: () => import('../../components/ContactForm') },

  data () {
    return {
      aboutUrl: config.aboutUrl,
      serverOnline: true
    }
  },

  mounted() {
    this.checkConnection()
  },

  methods: {
    checkConnection () {
      this.$http.get('status')
        .then(() => { this.serverOnline = true })
        .catch(() => { this.serverOnline = false })
    },
    visibilityChanged (isVisible, entry, count) {
      const { target } = entry

      if (isVisible) {
        target.classList.remove('invisible')
        target.classList.add('visible')
      }

      if (count && isVisible) {
        setTimeout(() => {
          this.$refs.counts[count.index].start()
        }, this.countAnimationDelay)
      }
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
