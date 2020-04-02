<template>
  <div>
    <section class="static-section" :class="{ 'theme-section': !inLTI }">
      <article class="text-center">

        <router-link to="/">
          <div class="horizontal-logo"></div>
        </router-link>

      </article>
    </section>

    <section class="static-section grey-section">
      <article>
        <!-- Go back button -->
        <a href="" @click="goBack" class="btn-back">
          <i class="icon-arrow_back"></i>
          <span>{{ $t('SW_BACK') }}</span>
        </a>

        <p class="font-26 bold mb-10">
          {{ $t('SW_HEADER_' + $route.name.toUpperCase()) }}
        </p>
        <p class="text-muted mb-30"><strong>Last update August 16, 2018</strong></p>
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
import FooterCredits from './FooterCredits'
import FooterLinks from './FooterLinks'

export default {
  name: 'StaticPage',
  components: { FooterCredits, FooterLinks },

  data () {
    return {
      inLTI: this.$store.state.inLTI
    }
  },

  methods: {
    goBack (e) {
      e.preventDefault()
      window.history.length > 1 ? this.$router.back() : this.router.push('/')
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
