<template>
  <div class="app-footer">

    <!-- About logo -->
    <a v-if="aboutUrl" :href="aboutUrl" target="_blank">
      <span class="footer-logo"></span>
    </a>
    <router-link v-else to="/about" target="_blank" aria-hidden="true" tabindex="-1">
      <span class="footer-logo"></span>
    </router-link>

    <!-- Credit -->
    <div class="credits">
      <div class="mb-20" v-if="school && school.colofon && school.colofon[lang]">{{ $t('SW_AS_CLIENT_OF') }} {{ school.name[lang] }} &centerdot;
        <a class="footer-link" href="#" v-if="school && school.colofon" @click.prevent="toggleDialog">{{ $t('SW_COLOFON') }}</a>
      </div>

      &copy; {{ (new Date()).getFullYear() }} &centerdot;

      <a v-if="aboutUrl" class="footer-link" target="_blank" :href="aboutUrl">{{ productName }}</a>
      <el-button v-else type="text" class="footer-link" @click="openAbout">
        {{ productName }}
      </el-button>

      <span> {{ $t('SW_IS_BUILT_BY') }} </span>
      <a :href="business.url" rel="noreferrer" class="footer-link" target="_blank">{{ business.shortName }}</a>.
      <p>
        <el-button type="text" aria-label="Open terms page" class="footer-link" @click="openTerms">
          {{ $t('SW_TERMS') }}
        </el-button> |
        <el-button type="text" aria-label="Open privacy page" class="footer-link" @click="openPrivacy">
          {{ $t('SW_PRIVACY') }}
        </el-button> |
        <el-button type="text" aria-label="Open contact us dialog" class="footer-link" @click="openDialog">
          {{ $t('SW_CONTACT_US') }}
        </el-button>
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
      aboutUrl: config.aboutUrl,
      dialogContact: false,
      dialogColofon: false,
      productName: config.name,
      school: this.$store.state.school,
      lang: this.$store.state.lang,
      business: config.business
    }
  },

  methods: {
    openAbout () { this.$router.push({ name: 'about' }) },
    openTerms () { this.$router.push({ name: 'terms' }) },
    openPrivacy () { this.$router.push({ name: 'privacy' }) },
    openDialog () { this.dialogContact = true },
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
