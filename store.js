import Vue from 'vue'
import Vuex from 'vuex'
import config from 'config'

Vue.use(Vuex)

export const OPEN_SIDEBAR = 'OPEN_SIDEBAR'
export const CLOSE_SIDEBAR = 'CLOSE_SIDEBAR'
export const LOCATION_CHANGE = 'router/ROUTE_CHANGED'
export const WINDOW_RESIZE = 'WINDOW_RESIZE'
export const SET_USER = 'SET_USER'
export const SET_LANGUAGE = 'SET_LANGUAGE'
export const SET_LANGUAGES = 'SET_LANGUAGES'
export const SET_COURSE = 'SET_COURSE'

const state = {
  navAvailable: false,
  sidebarOpened: false,
  obfuscatorActive: false,
  isMobile: window.innerWidth < 768,
  school: false,
  course: false,
  user: false,
  inLTI: window.self !== window.top,
  slug: null,
  isAdmin: false,
  languages: config.languages,
  lang: config.defaultLanguage
}

const mutations = {
  [CLOSE_SIDEBAR] (state) {
    state.sidebarOpened = false
    state.obfuscatorActive = false
  },
  [OPEN_SIDEBAR] (state) {
    state.sidebarOpened = true
    state.obfuscatorActive = true
  },
  [LOCATION_CHANGE] (state) {
    state.sidebarOpened = false
    state.obfuscatorActive = false
  },
  [WINDOW_RESIZE] (state) {
    const { innerWidth } = window
    const isMobile = innerWidth < 768
    state.isMobile = isMobile
  },
  [SET_USER] (state, data) {
    const user = data.payload
    state.user = user
    state.school = user.organization
    state.slug = user.organization.slug
    state.isAdmin = user.organization.role === 'admin' || user.systemAdmin
    state.languages = getLanguages(user.organization.languages)
    state.lang = user.language
  },
  [SET_LANGUAGE] (state, data) {
    state.lang = data.payload
  },
  [SET_LANGUAGES] (state, data) {
    state.languages = getLanguages(data.payload)
  },
  [SET_COURSE] (state, data) {
    state.course = data.payload
  }
}

const actions = {
  openSidebar ({ commit }) {
    commit({ type: OPEN_SIDEBAR })
  },
  closeSidebar ({ commit }) {
    commit({ type: CLOSE_SIDEBAR })
  },
  handleResize ({ commit }) {
    commit({ type: WINDOW_RESIZE })
  },
  setUser ({ commit }, payload) {
    commit({ type: SET_USER, payload })
  },
  setLanguage ({ commit }, payload) {
    commit({ type: SET_LANGUAGE, payload })
  },
  setLanguages ({ commit }, payload) {
    commit({ type: SET_LANGUAGES, payload })
  },
  setCourse ({ commit }, payload) {
    commit({ type: SET_COURSE, payload })
  },
  setMobileView ({ commit }, payload) {
    commit({ type: WINDOW_RESIZE, payload })
  }
}

function getLanguages (langs) {
  const array = []
  if (langs.en) array.push('en')
  if (langs.nl) array.push('nl')
  return array
}

const store = new Vuex.Store({
  state,
  actions,
  mutations
})

export default store
