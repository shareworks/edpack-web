import { router } from '../../router'
import store from '../store'
import LanguagePlugin from './language'

export default {
  install (Vue, options) {
    const i18n = LanguagePlugin.geti18n()

    router.beforeEach((to, from, next) => {
      // If no changes to a form, continue
      if (!store.state.unsavedChanges) return next()

      // Else, ask for confirmation to discard changes
      router.app.$confirm(i18n.t('SW_DISCARD_CHANGED_TEXT'), i18n.t('SW_DISCARD_CHANGED'), {
        confirmButtonText: i18n.t('SW_DISCARD_AND_CONTINUE'),
        cancelButtonText: i18n.t('SW_CANCEL')
      })
        .then(() => {
          store.dispatch('setUnsavedChanges', false)
          next()
        })
        .catch(() => { next(from) })
    })
  }
}
