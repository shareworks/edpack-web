<template>
    <img v-if="lms || lti" :src="`/images/${lms || lti}-logo.png`" class="lms-icon" alt="">
</template>

<script>
import getLmsType from '../../utils/get-lms-type'

export default {
    name: 'LmsIcon',
    props: ['model'],

    data () {
      return {
        lms: getLmsType(this.model),
        lti: this.getLtiType(this.model),
      }
    },

    methods: {
      getLtiType (model) {
        if (model.initializedDuring === 'ltiBasic') return 'lti-1_1'
        if (model.initializedDuring === 'ltiAdvantage') return 'lti-1_3'
        return false
      }
    }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
