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

        <!-- Reset Form -->
        <reset-form></reset-form>

        <!-- Footer links -->
       <footer-links :signin="true"></footer-links>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import ResetForm from '../../components/ResetForm'
import FooterLinks from '../../components/FooterLinks'
import AnimatedLanding from '../../../components/AnimatedLanding'

export default {
  name: 'Reset',
  metaInfo: { title: 'Reset password' },
  components: { FooterLinks, AnimatedLanding, ResetForm }
}
</script>

<style lang="scss">
    @import '~scss_vars';
    @import './style.scss';
</style>
