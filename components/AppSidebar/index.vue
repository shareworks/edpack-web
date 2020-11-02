<template>
  <div id="sidebar" :class="{'open': active}">
    <el-menu class="sidebar-menu" :default-active="activeTab">

      <!-- Logo -->
      <div class="logo-container">
        <img class="logo" src="/images/icon.png" alt="" />
      </div>

      <!-- Sidebar menu -->
      <el-menu-item index="home" @click="tabClick('home')">
        <span>{{ $t('SW_HOME') }}</span>
      </el-menu-item>
      <el-menu-item v-if="isAdmin" index="admin" @click="tabClick('admin')">
        <span>{{ $t('SW_DASHBOARD') }}</span>
      </el-menu-item>
      <el-menu-item index="" class="hide"></el-menu-item>
    </el-menu>
  </div>
</template>

<script>
export default {
  name: 'AppSidebar',
  props: ['active', 'closeSidebar'],

  data () {
    return {
      user: this.$store.state.user,
      school: this.$store.state.school,
      activeTab: 'home'
    }
  },

  watch: {
    $route (to) {
      if (to.name === 'admin') this.activeTab = 'admin'
      else if (to.name === 'home') this.activeTab = 'home'
      else this.activeTab = ''
    }
  },

  computed: {
    isAdmin () {
      return this.$store.state.user.systemAdmin || this.$store.state.user.role === 'admin'
    }
  },

  methods: {
    tabClick (tab) {
      this.activeTab = tab
      const route = { name: tab, params: { slug: this.school.slug } }
      this.$router.push(route)
      this.closeSidebar()
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
