<template>
  <div>
    <el-row type="flex" justify="center" align="middle" class="minimum-page">
      <el-col>
        <div class="public-background"></div>

        <!-- Logo -->
        <div class="horizontal-logo"></div>

        <!-- Log in panel -->
        <register class="mb-30"></register>

        <!-- Footer links -->
        <footer-links class="mt-10"></footer-links>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Register from '../../components/Register'
import FooterLinks from '../../components/FooterLinks'

export default {
  name: 'Invitation',
  metaInfo: { title: 'Accept invitation' },
  components: { Register, FooterLinks }
}
</script>

<style lang="scss">
    @import '~scss_vars';
    @import './style.scss';
</style>
