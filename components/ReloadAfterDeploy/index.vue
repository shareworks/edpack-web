<template>
  <div></div>
</template>

<script>
import moment from 'moment'
import { router } from '@/router'
export default {
  name: 'ReloadAfterDeploy',

  mounted () {
    router.onError(error => {
      const pattern = /chunk ?.*(\d.*) failed\./
      const isChunkLoadFailure = error.message.match(pattern)

      if (isChunkLoadFailure) {
        const reloadedDate = this.$ls.get('reloaded')
        const justReloaded = reloadedDate && (moment(new Date()).diff(moment(reloadedDate), 'seconds' < 60))

        // If not already reloaded in last minute, ask for reload.
        if (!justReloaded) this.askForReload()
      }
    })
  },

  methods: {
    askForReload () {
      this.$confirm(this.$i18n.t('SW_APP_JUST_UPDATED_TEXT'), this.$i18n.t('SW_APP_JUST_UPDATED'), {
        confirmButtonText: this.$i18n.t('SW_RELOAD'),
        cancelButtonText: this.$i18n.t('SW_CANCEL')
      }).then(() => {
        const now = new Date()
        this.$ls.set('reloaded', now)
        Location.reload(true)
      })
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
