<template>
  <el-row type="flex" justify="center" align="middle" class="minimum-page">
    <el-col>
      <div class="public-background"></div>

      <!-- Logo -->
      <router-link to="/about" class="inline"><span class="horizontal-logo"></span></router-link>

      <!-- Text -->
      <p class="contact-title bold font-20 mb-30">{{ $t('SW_CONTACT_US') }}</p>

      <!-- Contact form -->
      <div class="contact-form-wrapper invisible text-left" v-observe-visibility="{callback: visibilityChanged, throttle: 200, once: true}">
        <contact-form></contact-form>
      </div>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: 'contact-us',
  metaInfo: {
    title: 'Contact us'
  },
  components: { ContactForm: () => import('../../components/ContactForm') },
  methods: {
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
