<template>
  <div>
    <page-cover>
        <!-- Headers -->
        <h3 class="mb-20 font-18 max-600">
          <div v-if="step === 0">
            <p>{{ $t('SW_TEST_MAILING') }}</p>
          </div>
        </h3>
    </page-cover>

    <div class="mt-20">
      <el-button class="ml-10" type="text" @click="closeDialog()">{{ $t('SW_CANCEL') }}</el-button>
    </div>
  </div>
</template>

<script>

export default {
  name: 'TestMailingDialog',
  props: ['closeDialog'],
  components: { },

  data () {
    return {

    }
  },

  methods: {

  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
  @import '../../../../src/styles/logo-animation.scss';
</style>
