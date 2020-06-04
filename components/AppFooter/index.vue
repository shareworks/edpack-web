<template>
  <div class="app-footer">

    <!-- About logo -->
    <router-link to="/about" target="_blank" aria-hidden="true" tabindex="-1">
      <span class="footer-logo"></span>
    </router-link>

    <!-- Credit -->
    <div class="credits">
      <div class="mb-20" v-if="school && school.colofon && school.colofon[lang]">{{ $t('SW_AS_CLIENT_OF') }} {{ school.name[lang] }} &centerdot;
        <a class="footer-link" href="#" v-if="school && school.colofon" @click.prevent="toggleDialog">{{ $t('SW_COLOFON') }}</a>
      </div>

      &copy; {{ (new Date()).getFullYear() }} &centerdot; <router-link class="footer-link" to="/about" target="_blank">{{ productName }}</router-link>
      {{ $t('SW_IS_BUILT_BY') }}
      <a :href="business.url" rel="noreferrer" class="footer-link" target="_blank">{{ business.shortName }}</a>.
      <p class="mt-10">
        <router-link class="footer-link" to="/terms">{{ $t('SW_TERMS') }}</router-link> |
        <router-link class="footer-link" to="/privacy">{{ $t('SW_PRIVACY') }}</router-link> |
        <a href="#" class="footer-link" @click.prevent="openDialog">{{ $t('SW_CONTACT_US') }}</a>
      </p>
    </div>

    <!-- Contact dialog -->
    <el-dialog :title="$t('SW_CONTACT_US')" append-to-body :visible.sync="dialogContact">
      <contact-form v-if="dialogContact" :closeDialog="closeDialog"></contact-form>
    </el-dialog>

    <!-- Colofon dialog -->
    <el-dialog :title="$t('SW_COLOFON')" v-if="school && school.colofon" append-to-body :visible.sync="dialogColofon">
      <div class="redactor-in" v-html="school.colofon[lang]"></div>
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
      dialogColofon: false,
      productName: config.name,
      school: this.$store.state.school,
      lang: this.$store.state.lang,
      business: config.business
    }
  },

  methods: {
    openDialog () {
      this.dialogContact = true
    },
    closeDialog () {
      this.dialogContact = false
    },
    toggleDialog () {
      this.dialogColofon = !this.dialogColofon
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
