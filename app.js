// Polyfills
import 'intersection-observer'
import 'whatwg-fetch'
import 'promise-polyfill'

// Core (Vue) functionality
import Vue from 'vue'
import VueAnalytics from 'vue-analytics'
import moment from 'moment'
import XBrowserUpdate from 'x-browser-update'
import { sync } from 'vuex-router-sync'
import VueProgressBar from 'vue-progressbar'
import MugenScroll from 'vue-mugen-scroll'
import vueNumeralFilterInstaller from 'vue-numeral-filter'
import VueMeta from 'vue-meta'
import VueMasonry from 'vue-masonry-css'

// Main app component
import App from './components/App/index'

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

// Store & Router stuff
import store from './store'
import { router } from '../router'

// Custom Plugins
import LanguagePlugin from './plugins/language'
import BugsnagPlugin from './plugins/bugsnag'
import LocalStoragePlugin from './plugins/local-storage'
import AxiosPlugin from './plugins/axios'
import RouterAfterEachPlugin from './plugins/router-after-each'
import RouterBeforeEachPlugin from './plugins/router-before-each'
import VueObserveVisibility from 'vue-observe-visibility'

sync(store, router)

// Init Custom plugins
Vue.use(LocalStoragePlugin)
Vue.use(BugsnagPlugin)
Vue.use(LanguagePlugin)
Vue.use(AxiosPlugin)
Vue.use(VueObserveVisibility)

// Init Vue dependencies
Vue.use(Element, { locale: elLocaleEn, size: 'normal' })
Vue.use(XBrowserUpdate)
Vue.use(VueProgressBar, { color: config.themeColor, failedColor: 'red', height: '2px' })
Vue.use(vueNumeralFilterInstaller, { locale: 'en-gb' })
Vue.use(VueMeta)
Vue.use(VueMasonry)

// Initialize Google Analytics
Vue.use(VueAnalytics, { id: config.analytics })

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

// Init global components
Vue.component('spinner', Spinner)
Vue.component('thumbnail', Thumbnail)
Vue.component('appLanguage', AppLanguage)
Vue.component('pageCover', PageCover)
Vue.component('pageHeader', PageHeader)
Vue.component('affix', Affix)
Vue.component('mugenScroll', MugenScroll)

const app = new Vue({
  router,
  store,
  i18n,
  ...App
})

export { app, router, store }
