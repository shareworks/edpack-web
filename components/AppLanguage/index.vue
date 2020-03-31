<template>
  <div class="app-language hidden-xs" v-if="canSwitch">
    <el-dropdown @command="handleLanguage">
      <el-button :type="big ? 'default' : 'text'" :size="big ? '': 'medium'">
        <img :src="'/images/' + currentLanguage + '.png'" class="language-icon" alt="">
        <span v-if="big" class="ml-5">{{ $t('SW_DEFAULT_' + currentLanguage.toUpperCase()) }}</span>

        <i class="el-icon-caret-bottom el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item v-for="language in languages" :key="language" :command="language">
          <img :src="'/images/' + language + '.png'" class="language-icon" alt="">
          <span class="ml-5">{{ $t('SW_DEFAULT_' + language.toUpperCase()) }}</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import { loadLanguages } from '@/utils/load-languages'
import config from 'config'

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
    handleLanguage (newLanguage) {
      const isOtherLanguage = this.currentLanguage !== newLanguage

      // If not changed, stop here
      if (!isOtherLanguage) return false

      this.currentLanguage = newLanguage
      loadLanguages(this.$i18n, newLanguage)
      this.$message({ message: this.$i18n.t('SW_LANGUAGE_CHANGED'), type: 'success' })

      // If not logged in, stop here
      if (!this.currentUser) return this.$ls.set('visitorLanguage', newLanguage)

      // If logged in, update current user
      this.currentUser.language = newLanguage
      this.$http.put(`users/${this.currentUser._id}`, this.currentUser)
        .then(() => { this.$store.dispatch('setUser', this.currentUser) })
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
