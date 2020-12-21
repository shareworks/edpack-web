<template>
  <div></div>
</template>

<script>
import moment from 'moment'
import config from 'config'
import { router } from '../../../router'
export default {
  name: 'ReloadAfterDeploy',
  data () {
    return {
      appName: config.name
    }
  },

  mounted () {
    router.onError(error => this.checkReloadFailure(error))
  },

  methods: {
    checkReloadFailure (error) {
      console.log(error.message)
      let isChunkLoadFailure = error.message.toLowerCase().includes('chunkloaderror')
      if (!isChunkLoadFailure) isChunkLoadFailure = error.message.toLowerCase().includes('unexpected token')

      if (isChunkLoadFailure) {
        const reloadedDate = this.$ls.get('reloaded')
        const justReloaded = reloadedDate && (moment(new Date()).diff(moment(reloadedDate), 'seconds') < 100)

        // If not already reloaded in last minute, ask for reload.
        if (!justReloaded) this.askForReload()
      }
    },
    askForReload () {
      this.$confirm(this.$i18n.t('SW_APP_JUST_UPDATED_TEXT', [this.appName]), this.$i18n.t('SW_APP_JUST_UPDATED'), {
        showCancelButton: false,
        confirmButtonText: this.$i18n.t('SW_RELOAD')
      }).then(() => {
        const now = new Date()
        this.$ls.set('reloaded', now)
        window.location.reload()
      })
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
