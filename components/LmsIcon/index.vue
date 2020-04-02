<template>
    <img v-if="lms" :src="'/images/' + lms + '-logo.png'" class="lms-icon" alt="">
</template>

<script>
import getLmsType from '../../utils/get-lms-type'

export default {
  name: 'LmsIcon',
  props: ['model'],

  data () {
    return {
      lms: getLmsType(this.model)
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
