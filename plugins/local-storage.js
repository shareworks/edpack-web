import VueLocalStorage from 'vue-ls'

export default {
  install (Vue, options) {
    // Some browsers do not accept local storage. Then fall back to memory storage
    try {
      const localStorageOptions = { namespace: 'sw_' }
      Vue.use(VueLocalStorage, localStorageOptions)
    } catch (err) {
      const localStorageOptions = { namespace: 'sw_', storage: 'memory' }
      Vue.use(VueLocalStorage, localStorageOptions)
    }
  }
}
