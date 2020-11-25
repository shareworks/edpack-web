import config from 'config'
import Bugsnag from '@bugsnag/js'
import BugsnagPluginVue from '@bugsnag/plugin-vue'

Bugsnag.start({
  apiKey: config.bugsnag,
  notifyReleaseStages: ['development', 'staging', 'production'],
  releaseStage: process.env.NODE_ENV,
  plugins: [new BugsnagPluginVue()]
})

export default Bugsnag
