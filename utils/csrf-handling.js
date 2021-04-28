import Axios from 'axios'
import Vue from 'vue'

export {
  loadCsrfToken,
  setCsrfToken,
  removeCsrfToken
}

const urlParams = new URLSearchParams(window.location.search)
const origin = urlParams.get('origin')

const inLTI = Vue.ls.get('inLti') || (origin === 'lti') || (window.self !== window.top)

// Load from local storage
function loadCsrfToken () {
  let csrfToken = false

  if (inLTI) csrfToken = Vue.ls.get('csrfTokenLTI')
  else csrfToken = Vue.ls.get('csrfToken')
  if (csrfToken) Axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken
}

// Set token from header
function setCsrfToken (res) {
  const csrfToken = res.data.csrfToken

  if (!csrfToken) return
  Axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken

  if (inLTI) Vue.ls.set('csrfTokenLTI', res.data.csrfToken)
  else Vue.ls.set('csrfToken', res.data.csrfToken)
  delete res.data.csrfToken
}

// Remove from storage
function removeCsrfToken () {
  if (inLTI) Vue.ls.remove('csrfTokenLTI')
  else Vue.ls.remove('csrfToken')

  Axios.defaults.headers.common['X-CSRF-TOKEN'] = ''
}
