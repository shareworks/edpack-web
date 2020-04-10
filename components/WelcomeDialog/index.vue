<template>
  <div class="welcome-dialog">
    <div class="horizontal-logo"></div>
    <h3 class="mb-20 font-18">
      {{ $t('SW_WELCOME_ABOUT') }}

      <a href @click="openAbout">
        <strong>{{ $t('SW_LEARN_MORE') }}</strong>
      </a>
    </h3>

    <p class="mb-20">{{ $t('SW_WELCOME_TEXT') }}
      <span v-if="showChatLink">{{ $t('SW_WELCOME_TEXT1') }} <a href @click="openChat">{{ $t('SW_WELCOME_TEXT2') }}</a></span>
      <span v-else>{{ $t('SW_WELCOME_TEXT3') }}</span>.
    </p>
    <p class="mb-30">{{ $t('SW_GOOD_LUCK') }}</p>

    <app-language class="mr-10" :big="true"></app-language>

    <el-button type="primary" @click="closeDialog">
      <strong>
        {{ $t('SW_CONTINUE') }}
        <i class="icon-arrow_forward"></i>
      </strong>
    </el-button>
  </div>
</template>

<script>
export default {
  name: 'WelcomeDialog',
  props: ['closeDialog'],
  components: { },

  data () {
    return {
      showChatlink: this.school.role !== 'student' && this.$store.state.school.enableFreshChat,
      school: this.$store.state.school
    }
  },

  methods: {
    openAbout (e) {
      e.preventDefault()
      window.open('/about')
    },
    openChat (e) {
      e.preventDefault()
      window.fcWidget.open()
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
