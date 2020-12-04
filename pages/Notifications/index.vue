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
          <strong class="font-16" v-if="status === 'error'">{{ error.split(':')[1] }}</strong>
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
      error: '',
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

      this.$http.put(`users/${this.id}/disable-notification/${this.type}`, {}, { params: { token: this.token } })
        .then(res => { this.status = res.data.status })
        .catch((err) => {
          this.error = err.data.errors[0].message
          this.status = 'error'
        })
    }
  }
}
</script>
