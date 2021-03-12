<template>
  <div class="app-language hidden-xs" v-if="canSwitch">
    <el-dropdown @command="checkUnsavedChanges">
      <!-- Language button -->
      <el-button aria-label="Choose language" :type="big ? 'default' : 'text'" :size="big ? '': 'medium'">
        <img :src="'/img/' + currentLanguage + '.png'" class="language-icon" alt="language-icon">
        <span v-if="big" class="ml-5">{{ $t('SW_DEFAULT_' + currentLanguage.toUpperCase()) }}</span>

        <i class="el-icon-caret-bottom el-icon--right"/>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <!-- Language items -->
        <el-dropdown-item v-for="language in languages" :key="language" :command="language">
          <img :src="'/img/' + language + '.png'" class="language-icon" alt="language-icon">
          <span class="ml-5">{{ $t('SW_DEFAULT_' + language.toUpperCase()) }}</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import config from 'config'
import { loadLanguages } from '../../utils/load-languages'
export default {
  name: 'AppLanguage',
  props: ['big'],

  data () {
    return {
      currentUser: this.$store.state.user,
      canSwitch: this.$store.state.languages.length > 1 && config.languages.length > 1,
      languages: this.$store.state.languages,
      currentLanguage: this.$store.state.user ? this.$store.state.user.language : this.$ls.get('visitorLanguage') || 'en'
    }
  },

  methods: {
    checkUnsavedChanges (newLanguage) {
      if (this.currentLanguage === newLanguage) return
      if (!this.$store.state.unsavedChanges) return this.handleLanguage(newLanguage)

      // Else, ask for confirmation to discard changes
      this.$confirm(this.$i18n.t('SW_DISCARD_CHANGED_TEXT'), this.$i18n.t('SW_DISCARD_CHANGED'), {
        confirmButtonText: this.$i18n.t('SW_DISCARD_AND_CONTINUE'),
        cancelButtonText: this.$i18n.t('SW_CANCEL')
      })
        .then(() => {
          this.$store.dispatch('setUnsavedChanges', false)
          this.handleLanguage(newLanguage)
        })
        .catch(() => { console.log('language change cancelled') })
    },
    handleLanguage (newLanguage) {
      this.currentLanguage = newLanguage
      loadLanguages(this.$i18n, newLanguage)

      const text = {
        en: 'Your preferred language has been changed to English.',
        nl: 'Jouw voorkeurstaal is nu ingesteld op Nederlands.'
      }

      this.$message({ message: text[this.currentLanguage], type: 'success' })

      // If not logged in, stop here
      if (!this.currentUser) return this.$ls.set('visitorLanguage', newLanguage)

      // If logged in, update current user
      this.currentUser.language = newLanguage
      this.$http.put(`users/${this.currentUser._id}`, this.currentUser)
        .then(() => { this.$store.dispatch('setUser', this.currentUser) })
        .catch(e => console.log(e))
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
