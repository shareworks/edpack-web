<template>
  <!-- Open in new tab -->
  <el-button v-if="newTabButtonVisible && school.openNewLtiTab" size="medium" type="primary" class="button-square-xs mr-5" plain @click="openNewTab">
    <i class="icon-newtab"/>
  </el-button>
</template>

<script>
export default {
  name: 'NewTabButton',
  data () {
    const newTabButtonVisible = window.top !== window.self
    return {
      newTabButtonVisible,
      school: this.$store.state.school
    }
  },

  methods: {
    openNewTab () {
      const url = new URL(window.location + '&fromLtiTab=true')
      window.open(url.toString())
    }
  }
}
</script>
