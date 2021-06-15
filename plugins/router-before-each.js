import AxiosPlugin from './axios'
import isAuthorized from './is-authorized'
import { router } from '../../router'
import config from 'config'
import mockUser from '@/edpack-web/mock-user'
import store from '../store'
import { setCsrfToken } from '../utils/csrf-handling'
import Axios from 'axios'
import { loadLanguages } from '../utils/load-languages'
import LanguagePlugin from './language'
import * as ackeeTracker from '../utils/ackee-tracker'

export default {
  install (Vue, options) {
    const i18n = LanguagePlugin.geti18n()
    const inLTI = store.state.inLTI

    // Mock user
    if (config.mock_user) {
      mockUser.organization = mockUser.organizations[0]
      return store.dispatch('setUser', mockUser)
    }

    router.beforeEach((to, from, next) => {
      // Abort some routes in LTI mode
      if (to.meta.abortInLTI && inLTI && from.name) return next(from)

      // Track with Ackee
      if (config.ackee) {
        const ackeeOptions = { ...config.ackee.options, organization: store.state?.user?.organization?._id }
        ackeeTracker.create(config.ackee.api_url, ackeeOptions).record(config.ackee.key)
      }

      // Check authorization for user with session
      if (store.state.user) {
        if (!isAuthorized.check(store.state.user, to)) return next({ replace: true, name: 'error', query: { type: 'restricted_access' } })
        return next()
      }

      // Check user when auth required, but also when user enters on landing
      const checkUser = to.meta.auth || to.name === 'landing' || to.name === 'root'
      if (!checkUser) return next()

      // Get user and check
      const params = {}

      // TODO: explain what this does here
      if ((to.query.ltiForwardToken || to.query.ltiAccessToken) && to.query.organization) {
        store.dispatch('setLti', true)
        AxiosPlugin.addLtiOrigin()
        params.params = { organization: to.query.organization }
        params.headers = to.query.ltiForwardToken ? { 'Lti-Forward-Token': to.query.ltiForwardToken } : { 'Lti-Access-Token': to.query.ltiAccessToken }
      }

      return router.app.$http.get('users/self', params)
        .then((res) => {
          const user = res.data.list[0]

          // set CSRF token
          if (!inLTI) setCsrfToken(res)

          // Check if LTI token is on res.data, and set header
          if (inLTI && res.data.ltiAccessToken) Axios.defaults.headers.common['Lti-Access-Token'] = res.data.ltiAccessToken

          // Check if org exists
          if (!user.organization) return next({ replace: true, name: 'error', query: { type: 'no_organization' } })

          // Set user if in correct org
          if (!to.params.slug || user.organization.slug === to.params.slug) return setUser(user, to, next)

          // Switch org or stop
          const switchToOrg = user.organizations.find(org => org.slug === to.params.slug)
          if (!switchToOrg) return next({ replace: true, name: 'error', query: { type: 'restricted_access' } })
          user.organization = switchToOrg

          // Update API session with other org
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

      // Redirect to home or admin
      const redirectTo = { replace: true, name: 'home', params: { slug: user.organization.slug } }
      if (store.state.isAdmin) redirectTo.name = 'admin'
      if (['landing', 'root'].includes(to.name)) return next(redirectTo)

      // Check authorization
      else if (isAuthorized.check(user, to)) return next()
      else return next({ replace: true, name: 'error', query: { type: 'restricted_access' } })
    }

    function onError (to, next) {
      // When no auth was necessary, continue
      if (!to.meta.auth) return next()

      // In LTI, send to error page
      if (inLTI) return next({ replace: true, name: 'error', query: { type: 'lti_error' } })
      return next({ replace: true, name: 'landing', query: { redirect: window.location.pathname } })
    }
  }
}
