<template>
  <el-row type="flex" justify="center" align="middle" class="minimum-page">
    <el-col>
      <div class="public-background"/>
      <!-- Logo -->
      <a v-if="aboutUrl" class="inline" :href="aboutUrl" target="_blank" :aria-label="$t('SW_LOGO_IMAGE')">
        <span class="horizontal-logo"/>
      </a>
      <router-link v-else to="/about" class="inline" :aria-label="$t('SW_LOGO_IMAGE')">
        <span class="horizontal-logo"/>
      </router-link>

      <!-- Text -->
      <p class="contact-title bold font-20 mb-30">{{ $t('SW_CONTACT_US') }}</p>

      <!-- Contact form -->
      <div class="contact-form-wrapper invisible text-left" v-observe-visibility="{ callback: visibilityChanged, throttle: 200, once: true }">
        <contact-form/>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import config from 'config'
import basicVisibilityChanged from '@/edpack-web/utils/basic-visibility-changed'
export default {
  name: 'contact-us',
  metaInfo: {
    title: 'Contact us'
  },
  components: { ContactForm: () => import('../../components/ContactForm') },

  data () {
    return {
      appName: config.name,
      aboutUrl: config.aboutUrl
    }
  },
  methods: {
    visibilityChanged (isVisible, entry) {
      basicVisibilityChanged(isVisible, entry, 'invisible', 'visible')
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
