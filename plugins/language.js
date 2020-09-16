import localeEn from '../../en.json'
import localeNl from '../../nl.json'
import VueI18n from 'vue-i18n'

let localeEnBasic
let localeNlBasic

try {
  localeEnBasic = require('../en.json')
  localeNlBasic = require('../nl.json')
} catch (ex) {
  localeEnBasic = {}
  localeNlBasic = {}
}

export default {
  install (Vue, options) {
    Vue.use(VueI18n)

    this.i18n = new VueI18n({
      locale: 'en',
      fallbackLocale: 'en',
      messages: {
        en: { ...localeEnBasic, ...localeEn },
        nl: { ...localeNlBasic, ...localeNl }
      }
    })
  },
  geti18n () {
    return this.i18n
  }
}
