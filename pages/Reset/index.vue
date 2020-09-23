<template>
  <div>
    <animated-landing class="animated"></animated-landing>
    <el-row type="flex" justify="center" align="middle" class="minimum-page">
      <el-col>
        <!-- Show BG -->
        <div class="public-background"></div>

        <!-- Logo -->
        <div class="text-center">
            <div class="horizontal-logo"></div>
        </div>

        <div class="minimum-container">
          <div class="title text-center"><strong>{{ $t('SW_RESET_PASSWORD') }}</strong></div>
          <p class="mb-20 text-center">{{ $t('SW_RESET_PASSWORD_TEXT', [appName]) }}</p>

          <!-- Reset Form -->
        <reset-form></reset-form>

        </div>

        <!-- Footer links -->
       <footer-links :signin="true"></footer-links>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import config from 'config'
import ResetForm from '../../components/ResetForm'
import FooterLinks from '../../components/FooterLinks'
import AnimatedLanding from '../../../components/AnimatedLanding'

export default {
  name: 'Reset',
  metaInfo: { title: 'Reset password' },
  components: { FooterLinks, AnimatedLanding, ResetForm },
  data () {
    return {
      appName: config.name,
    }
  }
}
</script>
