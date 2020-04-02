import localeEn from '../../en.json'
import VueI18n from 'vue-i18n'

export default {
  install (Vue, options) {
    Vue.use(VueI18n)

    this.i18n = new VueI18n({
      locale: 'en',
      fallbackLocale: 'en',
      messages: { en: localeEn }
    })
  },
  geti18n () {
    return this.i18n
  }
}
