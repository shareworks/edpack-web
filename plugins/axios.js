// Check if app is started using LTI
import { loadCsrfToken, removeCsrfToken } from '../utils/csrf-handling'
import Axios from 'axios'
import config from 'config'
import { router } from '../../router'
import store from '../store'
import Language from './language'

export default {
  install (Vue, options) {
    const inLTI = this.setInLTI()
    const i18n = Language.geti18n()

    // Directly call load csrf token
    if (!inLTI) loadCsrfToken()

    // Axios for http requests
    Axios.defaults.baseURL = config.api_url
    Axios.defaults.headers.common.Accept = 'application/json'
    Axios.defaults.withCredentials = true
    Axios.defaults.timeout = 30000

    if (inLTI) this.addLtiOrigin()

    // Global error code, others we do in component
    Axios.interceptors.response.use(
      response => response,
      (error) => {
        let errorMessage = false
        let errorType = 'error'
        const status = error.response ? error.response.status : false

        // Unauthenticated
        if (status === 401) {
          removeCsrfToken()
          if (inLTI) router.push({ name: 'error', query: { type: 'LTI_ERROR' } })
          if (store.state.user) {
            Axios.post('users/logout', {})
              .then(() => {
                if (window.fcWidget) window.fcWidget.destroy()
                else router.push({ name: 'landing', query: { redirect: window.location.pathname } })
              })
          }
        }

        // Session timeout
        if (status === 440) {
          removeCsrfToken()
          errorMessage = i18n.t('SW_NO_USER_SESSION')
          errorType = 'info'

          Axios.post('users/logout', {})
            .then(() => {
              if (window.fcWidget) window.fcWidget.destroy()
              if (inLTI) router.push({ name: 'error', query: { type: 'LTI_ERROR' } })
              else router.push({ name: 'landing', query: { redirect: window.location.pathname } })
            })
        }

        // Server crashed
        if (status === 503) errorMessage = i18n.t('SW_SERVER_MAINTENANCE', [config.name])

        // Server error
        if (status >= 500 && status !== 503) errorMessage = i18n.t('SW_ERROR_LOADING')

        // Return error
        if (errorMessage) router.app.$message({ message: errorMessage, type: errorType, duration: 6000 })
        throw error.response
      }
    )

    // Set axios as $http service
    Vue.$http = Axios
    Object.defineProperty(Vue.prototype, '$http', { get () { return Axios } })
  },

  addLtiOrigin () {
    Axios.interceptors.request
      .use((response) => {
        if (!response.params) response.params = {}
        response.params.origin = 'lti'
        return response
      })
  },

  setInLTI (bool) {
    if (typeof bool === 'undefined') bool = (window.self !== window.top)
    if (!bool) {
      const urlParams = new URLSearchParams(window.location.search)
      const issuer = urlParams.get('issuer')

      bool = (issuer === 'ilearn')
    }

    this.inLTI = bool
    return this.inLTI
  },

  getInLTI () {
    return this.inLTI
  }
}
