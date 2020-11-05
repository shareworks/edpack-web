<template>
  <div>
    <section class="static-section" :class="{ 'theme-section': !inLTI }">
      <article class="text-center">

        <!-- Logo -->
        <router-link to="/" :aria-label="$t('SW_LOGO_IMAGE')">
          <div class="horizontal-logo position-relative"></div>
        </router-link>

      </article>
    </section>

    <section class="static-section grey-section">
      <article>
        <!-- Go back button -->
        <a href="#" @click.prevent="goBack" class="btn-back">
          <i class="icon-arrow_back"></i>
          <span>{{ $t('SW_BACK') }}</span>
        </a>

        <p class="font-26 bold mb-10">
          {{ $t('SW_HEADER_' + $route.name.toUpperCase()) }}
        </p>
        <p class="text-muted mb-30"><strong>{{ $t('SW_LAST_UPDATE', lastUpdated) }}</strong></p>
      </article>
    </section>

    <section class="static-section white-section">
      <article class="static-max-width">
        <div class="static-page-content">
          <slot></slot>
        </div>
      </article>
    </section>

    <section class="static-section dark-section" v-if="!inLTI">
      <article class="text-center">

        <!-- Footer links -->
        <footer-links :signin="true"></footer-links>

        <!-- Credits and terms -->
        <footer-credits></footer-credits>
      </article>
    </section>
  </div>
</template>

<script>
import config from 'config'
import FooterLinks from '../FooterLinks'
import FooterCredits from '../FooterCredits'

export default {
  name: 'StaticPage',
  components: { FooterCredits, FooterLinks },

  data () {
    return {
      inLTI: this.$store.state.inLTI,
      lastUpdated: config.lastUpdated
    }
  },

  methods: {
    goBack () {
      window.history.length > 1 ? this.$router.back() : this.router.push('/')
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
