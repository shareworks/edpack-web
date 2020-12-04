<template>
  <div>
    <animated-landing class="animated"></animated-landing>
    <el-row type="flex" justify="center" align="middle" class="minimum-page">
      <el-col>
        <!-- Show BG -->
        <div class="public-background"></div>

        <!-- Logo -->
        <router-link to="/" :aria-label="$t('SW_LOGO_IMAGE')">
          <div class="horizontal-logo position-relative"></div>
        </router-link>

        <div class="minimum-container" v-loading="status === 'loading'">
          <div v-if="status === 'done'">
            <h3>{{ $t('SW_NOTIFICATION_DISABLED', [notificationType]) }}</h3>
            <p>{{ $t('SW_NOTIFICATION_DISABLED_TEXT') }}</p>
          </div>
          <!-- @TODO: add some logic for errors handling -->
          <p v-if="status === 'error'">error...</p>
        </div>

        <!-- Footer links -->
        <footer-links :signin="true"/>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import FooterLinks from '../../components/FooterLinks'
import AnimatedLanding from '../../../components/AnimatedLanding'

export default {
  name: 'Notifications',
  metaInfo: { title: 'Disable notification' },
  components: { FooterLinks, AnimatedLanding },
  computed: {
    notificationType () {
      return this.$i18n.t(`SW_${this.type.toUpperCase()}`)
    }
  },
  data () {
    return {
      status: false,
      id: this.$route.params.id,
      type: this.$route.params.type,
      token: this.$route.query.token
    }
  },
  mounted () {
    this.updateUserChecks()
  },
  methods: {
    updateUserChecks () {
      if (!this.id || !this.type || !this.token) return
      this.status = 'loading'

      this.$http.put(`users/${this.id}/disable-notification/${this.type}`, {}, { params: this.token })
        .then(res => {
          this.status = 'done'
          console.log('res', res)
        })
        .catch(err => {
          this.status = 'error'
          console.log('err', err)
        })
    }
  }
}
</script>
