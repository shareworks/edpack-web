<template>
  <div/>
</template>

<script>
import config from 'config'
import $script from 'scriptjs'

export default {
  name: 'Freshchat',
  data () {
    return {
      user: this.$store.state.user
    }
  },

  created () {
    const productName = config.name.toLowerCase()
    const user = this.user
    const name = this.user.name
    const arrName = name.split(' ')
    const firstName = arrName.slice(0, 1).join(' ') || 'Guest #firstname'
    const lastName = arrName.slice(1, arrName.length).join(' ') || 'Guest #lastName'
    const $http = this.$http

    // Load script
    $script('https://wchat.freshchat.com/js/widget.js', () => {
      if (!window.fcWidget) return

      // Init freshchat
      window.fcWidget.init({
        token: config.freshchatToken,
        host: 'https://wchat.freshchat.com',
        siteId: productName,
        faqTags: {
          tags: [productName],
          filterType: 'article'
        },
        externalId: user._id,
        config: config.freshchatConfig,
        restoreId: user.freshchatRestoreId ? user.freshchatRestoreId : null
      })

      window.fcWidget.user.get((resp) => {
        const status = resp && resp.status
        if (status !== 200) {
          window.fcWidget.user.setProperties({
            firstName,
            lastName,
            email: user.email,
            product: productName,
            organization: user.organization.shortName.en,
            organization_id: user.organization._id
          }).then((resp) => console.log('freshchat user created'))
        }
      })

      window.fcWidget.on('user:created', (resp) => {
        const status = resp && resp.status
        const data = resp && resp.data
        if (status === 200) {
          if (data.restoreId) {
            $http.put(`users/${user._id}/restore-id`, { restoreId: data.restoreId })
              .then(res => console.log('info: [freshchat] restore id saved!'))
              .catch(data => {
                if (!data || !data.list || !data.list.length) return
                const err = data.list[0]
                err.message = '[freshchat] restoring id: ' + err.message
                console.error(err)
              })
          }
        }
      })
    })
  }
}
</script>
