<template>
  <div>
    <el-row type="flex" justify="center" align="middle" class="minimum-page">
      <el-col>
        <!-- Show BG -->
        <div class="public-background"/>

        <!-- Logo -->
        <router-link to="/" :aria-label="$t('SW_LOGO_IMAGE')">
          <div class="horizontal-logo position-relative"/>
        </router-link>

        <!-- Error title and text -->
        <div class="minimum-container">
          <div class="title text-center">
            <strong>{{ $t('SW_OAUTH_SUCCEEDED') }}</strong>
          </div>

          <p class="mt-10 text-center">
            {{ $t('SW_SW_OAUTH_SUCCEEDED_TEXT') }}
          </p>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import config from 'config'
export default {
  name: 'Error',
  metaInfo: { title: 'Error' },
  components: {},

  data () {
    return {
    }
  },

  methods: {
    allowCookies () {
    }
  }
}
</script>

<style lang="scss">
    @import '~scss_vars';
    @import './style.scss';
</style>
