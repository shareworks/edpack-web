import bugsnag from '@bugsnag/js'
import config from 'config'
import bugsnagVue from '@bugsnag/plugin-vue'

const bugsnagClient = bugsnag({
  apiKey: config.bugsnag,
  notifyReleaseStages: ['development', 'staging', 'production'],
  releaseStage: process.env.NODE_ENV
})


export default {
  install (Vue, options) {
    bugsnagClient.use(bugsnagVue, Vue)
  }
}
