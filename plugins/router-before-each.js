import AxiosPlugin from './axios'
import isAuthorized from './is-authorized'
import { router } from '../../router'
import config from 'config'
import mockUser from 'config/mock-user'
import store from '../../store'
import { setCsrfToken } from '../utils/csrf-handling'
import Axios from 'axios'
import { loadLanguages } from '../utils/load-languages'
import LanguagePlugin from './language'

export default {
  install (Vue, options) {
    const i18n = LanguagePlugin.geti18n()
    let inLTI = AxiosPlugin.getInLTI()

    // Mock user
    if (config.mock_user) {
      mockUser.organization = mockUser.organizations[0]
      return store.dispatch('setUser', mockUser)
    }

    router.beforeEach((to, from, next) => {
      // Abort some routes in LTI mode
      if (to.meta.abortInLTI && inLTI && from.name) return next(from)

      // Check authorization for user with session
      if (store.state.user) {
        if (!isAuthorized.check(store.state.user, to)) return router.replace({ name: 'error', query: { type: 'restricted_access' } })
        return next()
      }

      // Check user when auth required, but also when user enters on landing
      const checkUser = to.meta.auth || to.name === 'landing' || to.name === 'root'
      if (!checkUser) return next()

      // Get user and check
      const params = {}

      if (to.query.ltiForwardToken && to.query.organization) {
        inLTI = AxiosPlugin.setInLTI(true)
        AxiosPlugin.addLtiOrigin()
        params.params = { organization: to.query.organization }
        params.headers = { 'Lti-Forward-Token': to.query.ltiForwardToken }
      }

      return router.app.$http.get('users/self', params)
        .then((res) => {
          const user = res.data.list[0]

          // set CSRF token
          if (!inLTI) setCsrfToken(res)

          // Check if LTI token is on res.data, and set header
          if (inLTI && res.data.ltiAccessToken) Axios.defaults.headers.common['Lti-Access-Token'] = res.data.ltiAccessToken

          // Check if org exists
          if (!user.organization) return router.push({ name: 'error', query: { type: 'no_organization' } })

          // Set user if in correct org
          if (!to.params.slug || user.organization.slug === to.params.slug) return setUser(user, to, next)

          // Switch org or stop
          const switchToOrg = user.organizations.find(org => org.slug === to.params.slug)
          if (!switchToOrg) return router.replace({ name: 'error', query: { type: 'restricted_access' } })

          // Update session with another org
          router.app.$http.put(`session/context?organization=${switchToOrg._id}`)
            .then(() => { setUser(user, to, next) })
            .catch(() => { onError(to, next) })
        })
        .catch(() => { onError(to, next) })
    })

    function setUser (user, to, next) {
      // Fall back to default organization language
      if (!user.organization.languages[user.language]) user.language = user.organization.defaultLanguage

      // Set user and organization/school in store
      store.dispatch('setUser', user)
      loadLanguages(i18n, user.language)

      // Redirect to admin
      const redirectTo = { name: 'admin', params: { slug: user.organization.slug, mode: 'courses' } }

      if (to.name === 'landing' || to.name === 'root') return router.push(redirectTo)

      // Check authorization
      if (isAuthorized.check(user, to)) return next()
      router.replace({ name: 'error', query: { type: 'restricted_access' } })
    }

    function onError (to, next) {
      // When no auth was necessary, continue
      if (!to.meta.auth) return next()

      // In LTI, send to error page
      if (inLTI) return router.push({ name: 'error', query: { type: 'lti_error' } })
      return router.push({ name: 'landing', query: { redirect: window.location.pathname } })
    }
  }
}
