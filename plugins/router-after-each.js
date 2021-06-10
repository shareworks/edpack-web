import { router } from '../../router'
import scrollTop from 'simple-scrolltop'
import store from '../store'
import { loadLanguages } from '../utils/load-languages'
import Language from './language'

export default {
  install (Vue, options) {
    router.afterEach((to, from) => {
      // Scroll to top for all pages
      scrollTop(0)

      // Check visitor language in local storage
      const visitorLanguage = Vue.ls.get('visitorLanguage')
      if (visitorLanguage && !store.state.user && Language.i18n.language !== visitorLanguage) {
        loadLanguages(Language.i18n, visitorLanguage)
        store.dispatch('setLanguage', visitorLanguage)
      }
    })
  }
}
