import axios from 'axios'
import moment from 'moment'
import config from 'config'

const loadedLanguages = [config.defaultLanguage]

export function loadLanguages (i18n, lang) {
  if (i18n.locale !== lang) {
    if (!loadedLanguages.includes(lang)) {
      return import(/* webpackChunkName: "lang-[request]" */ `root/${lang}.json`).then(msgs => {

        let basicLangPack
        try {
          basicLangPack = require(`../${lang}.json`)
        } catch (ex) {
          basicLangPack = {}
        }

        i18n.setLocaleMessage(lang, { ...basicLangPack, ...msgs.default })
        loadedLanguages.push(lang)
        return setI18nLanguage(i18n, lang)
      })
    }
    return Promise.resolve(setI18nLanguage(i18n, lang))
  }
  return Promise.resolve(lang)
}

function setI18nLanguage (i18n, lang) {
  i18n.locale = lang
  axios.defaults.headers.common['Accept-Language'] = lang
  document.querySelector('html').setAttribute('lang', lang)
  moment.locale(lang)
  return lang
}
