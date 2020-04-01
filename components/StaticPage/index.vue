<template>
  <div>
    <section class="static-section" :class="{ 'theme-section': !inLTI }">
      <article class="text-center">

        <router-link to="/">
          <div class="horizontal-logo invisible"></div>
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
        <el-button type="text" size="large" @click="$router.push({name: 'landing'})">
          <strong>{{ $t('SW_LOGIN') }}</strong>
        </el-button>
        <span class="link-separator">|</span>
        <el-button type="text" size="large" @click="dialogContact = true">
          <strong>{{ $t('SW_CONTACT_US') }}</strong>
        </el-button>

        <div class="text-center mt-30">
          <p class="mb-20">
            &copy; {{ (new Date()).getFullYear() }} &centerdot; {{ $t('SW_BUILT_BY') }}
            <a :href="businessUrl" target="_blank">{{ businessName }}</a>.
          </p>
          {{ $t('SW_READ_OUR') }}
          <router-link to="/terms">{{ $t('SW_TERMS').toLowerCase() }}</router-link> & <router-link to="/privacy">{{ $t('SW_PRIVACY').toLowerCase() }}</router-link>.
        </div>
      </article>
    </section>

    <!-- Contact dialog -->
    <el-dialog :title="$t('SW_CONTACT_US')" append-to-body :visible.sync="dialogContact">
      <contact-dialog v-if="dialogContact" :closeDialog="closeDialog"></contact-dialog>
    </el-dialog>

  </div>
</template>

<script>
import config from 'config'

export default {
  name: 'StaticPage',

  data () {
    return {
      dialogContact: false,
      appName: config.name,
      supportMail: config.supportMail,
      businessUrl: config.business.url,
      businessName: config.business.shortName,
      inLTI: this.$store.state.inLTI
    }
  },

  methods: {
    closeDialog () {
      this.dialogContact = false
    },
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
