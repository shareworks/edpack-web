<template>
  <header class="app-header clearfix">
    <div class="header-container">
      <!-- Header logo or text -->
      <div v-if="school.appName" class="app-header-title">{{ school.appName }}</div>
      <div v-else class="header-logo"></div>

      <!-- User dropdown menu -->
      <div class="header-user-container" v-if="user">
        <!-- User account -->
        <router-link class="user-account-link" :to="{ name: showProfile ? 'profile' : 'account', params: { slug: school.slug, id: user._id } }" aria-label="Account page">
            <thumbnail tabindex="0" :model="user" class="thumb-user mr-5 thumb-24"/>
            <strong class="hidden-sm-inline user-name">{{user.name}}</strong>
        </router-link>
      </div>
    </div>
  </header>
</template>

<script>
import config from 'config'

export default {
  name: 'LtiHeader',
  components: { },

  data () {
    return {
      school: this.$store.state.user.organization,
      showProfile: config.hasUserProfiles
    }
  },

  computed: {
    user () { return this.$store.state.user }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
