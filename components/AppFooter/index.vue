<template>
  <div class="app-footer">

    <!-- About logo -->
    <router-link to="/about" target="_blank" aria-hidden="true" tabindex="-1">
      <span class="footer-logo invisible"></span>
    </router-link>

    <!-- Credit -->
    <div class="credits">
      &copy; {{ (new Date()).getFullYear() }} &centerdot; <router-link class="footer-link" to="/about" target="_blank">{{ productName }}</router-link>
      {{ $t('SW_IS_BUILT_BY') }}
      <a :href="business.url" rel="noreferrer" class="footer-link" target="_blank">{{ business.shortName }}</a>.
      <p class="mt-5">
        <router-link class="footer-link" to="/terms">{{ $t('SW_TERMS') }}</router-link> |
        <router-link class="footer-link" to="/privacy">{{ $t('SW_PRIVACY') }}</router-link> |
        <a href="#" class="footer-link" @click="openDialog">{{ $t('SW_CONTACT_US') }}</a>
      </p>
    </div>

    <!-- Contact dialog -->
    <el-dialog :title="$t('SW_CONTACT_US')" append-to-body :visible.sync="dialogContact">
      <contact-form v-if="dialogContact" :closeDialog="closeDialog"></contact-form>
    </el-dialog>
  </div>
</template>

<script>
import config from 'config'

export default {
  name: 'AppFooter',
  components: { ContactForm: () => import('../../components/ContactForm') },

  data () {
    return {
      dialogContact: false,
      productName: config.name,
      business: config.business
    }
  },

  methods: {
    openDialog (e) {
      e.preventDefault()
      this.dialogContact = true
    },
    closeDialog () {
      this.dialogContact = false
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
