// Polyfills
import 'intersection-observer'
import 'whatwg-fetch'
import 'promise-polyfill'

// Core (Vue) functionality
import Vue from 'vue'
import VueGtag from 'vue-gtag'
import moment from 'moment'
import XBrowserUpdate from 'x-browser-update'
import { sync } from 'vuex-router-sync'
import VueProgressBar from 'vue-progressbar'
import MugenScroll from 'vue-mugen-scroll'
import vueNumeralFilterInstaller from 'vue-numeral-filter'
import VueMeta from 'vue-meta'
import VueMasonry from 'vue-masonry-css'
import Bugsnag from '@bugsnag/js'
import BugsnagPluginVue from '@bugsnag/plugin-vue'

// Main app component
import App from './components/App'

// Element
import Element from 'element-ui'
import elLocaleEn from 'element-ui/lib/locale/lang/en'

// Config
import config from 'config'

// Styling
import '../styles/index.scss'

// SW Components
import Spinner from './components/Spinner'
import Thumbnail from './components/Thumbnail'
import AppLanguage from './components/AppLanguage'
import PageCover from './components/PageCover'
import PageHeader from './components/PageHeader'
import Affix from './components/Affix'
import TableStatus from './components/TableStatus'
import SkipToMain from './components/SkipToMain'

// Store & Router stuff
import store from './store'
import { router } from '../router'

// Custom Plugins
import VueTruncate from 'vue-truncate-filter'
import LanguagePlugin from './plugins/language'
import LocalStoragePlugin from './plugins/local-storage'
import AxiosPlugin from './plugins/axios'
import RouterAfterEachPlugin from './plugins/router-after-each'
import RouterBeforeEachPlugin from './plugins/router-before-each'
import RouterUnsavedChanges from './plugins/router-unsaved-changes'
import VueObserveVisibility from 'vue-observe-visibility'
import VueClipboards from 'vue-clipboards'
import VueAnnouncer from '@vue-a11y/announcer'
import { FocusTrap } from 'focus-trap-vue'

sync(store, router)

// Init Bugsnag for staging and production
if (config.releaseStage !== 'local') {
  Bugsnag.start({
    apiKey: config.bugsnag,
    enabledReleaseStages: ['staging', 'production'],
    releaseStage: config.releaseStage || process.env.NODE_ENV,
    plugins: [new BugsnagPluginVue()]
  })

  Bugsnag.getPlugin('vue').installVueErrorHandler(Vue)
}

// Init Custom plugins
Vue.use(LocalStoragePlugin)
Vue.use(LanguagePlugin)
Vue.use(AxiosPlugin)
Vue.use(VueObserveVisibility)
Vue.use(VueTruncate)
Vue.use(VueClipboards)
Vue.use(VueAnnouncer, {}, router)

// Init Vue dependencies
Vue.use(Element, { locale: elLocaleEn, size: 'normal' })
Vue.use(XBrowserUpdate)
Vue.use(VueProgressBar, { color: config.themeColor, failedColor: 'red', height: '2px' })
Vue.use(vueNumeralFilterInstaller, { locale: 'en-gb' })
Vue.use(VueMeta)
Vue.use(VueMasonry)

// Init Google Analytics
const gaSetup = { config: { id: config.analytics } }
if (config.secondaryAnalytics) gaSetup.includes = [{ id: config.secondaryAnalytics }]
Vue.use(VueGtag, gaSetup, router)

// Run in debug when not in production
Vue.config.productionTip = false
Vue.config.debug = process.env.NODE_ENV !== 'production'
Vue.config.performance = process.env.NODE_ENV !== 'production'
Vue.config.devtools = process.env.NODE_ENV !== 'production'

// Internationalization
moment.locale(config.defaultLanguage)
const i18n = LanguagePlugin.geti18n()

// Init Custom routes plugins
Vue.use(RouterBeforeEachPlugin)
Vue.use(RouterAfterEachPlugin)
Vue.use(RouterUnsavedChanges)

// Init global components
Vue.component('spinner', Spinner)
Vue.component('thumbnail', Thumbnail)
Vue.component('appLanguage', AppLanguage)
Vue.component('pageCover', PageCover)
Vue.component('pageHeader', PageHeader)
Vue.component('tableStatus', TableStatus)
Vue.component('affix', Affix)
Vue.component('mugenScroll', MugenScroll)
Vue.component('FocusTrap', FocusTrap)
Vue.component('SkipToMain', SkipToMain)

const app = new Vue({
  router,
  store,
  i18n,
  ...App
})

export { app, router, store }
