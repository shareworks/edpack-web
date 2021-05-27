<template>
  <div>
    <div class="text-center footer-links">

      <div class="inline" v-if="signin">
        <!-- Log in -->
        <el-button v-if="!currentUser && !inLTI" size="large" type="text" @click="$router.push({ name: 'landing' })">
          <strong>{{ $t('SW_LOGIN') }}</strong>
        </el-button>

        <!-- Home -->
        <el-button v-if="currentUser && !inLTI && !hideHomeTab" size="large" type="text" @click="$router.push({ name: 'home' })">
          <strong>{{ $t('SW_HOME') }}</strong>
        </el-button>

        <span v-if="!inLTI" class="link-separator">|</span>
      </div>

      <!-- Learn more - redirect to another website -->
      <a v-if="aboutUrl" class="inline" :href="aboutUrl" target="_blank">
        <el-button tabindex="-1" size="large" type="text">
          <strong>{{ $t('SW_LEARN_MORE') }}</strong>
        </el-button>
      </a>

      <!-- Learn more redirect to About page -->
      <router-link :to="{ name: 'about' }" :target="inLTI ? '_blank' : 'self'" v-if="!aboutUrl && $route.name !== 'about'">
        <el-button size="large" type="text">
          <strong>{{ $t('SW_LEARN_MORE') }}</strong>
        </el-button>
      </router-link>

      <span class="link-separator" v-if="$route.name !== 'about'">|</span>

      <!-- Contact us -->
      <el-button size="large" type="text" @click="openContact">
        <strong>{{ $t('SW_CONTACT_US') }}</strong>
      </el-button>
    </div>
  </div>
</template>

<script>
import config from 'config'
export default {
  name: 'FooterLinks',
  props: ['signin'],

  data () {
    return {
      aboutUrl: config.aboutUrl,
      inLTI: this.$store.state.inLTI,
      hideHomeTab: config.hideHomeTab,
      currentUser: this.$store.state.user
    }
  },

  methods: {
    openContact () { this.$store.dispatch('setContactForm', true) }
  }
}
</script>

<style lang="scss">
</style>
