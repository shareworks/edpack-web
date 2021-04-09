<template>
  <div>
    <section>
      <masonry :cols="{default: 4, 800: 2, 500: 1}" :gutter="{default: '20px'}">
        <div></div>

        <div class="mb-20 text-center">
          <el-button class="download-button" type="primary" size="medium" @click="testTemplateMailing" :loading="loading">
            <i class="icon-download"></i>
            {{ $t('SW_TEST_TEMPLATE_MAILING') }}
          </el-button>
        </div>

        <!-- Download .zip -->
        <div class="mb-20 text-center">
          <el-button class="download-button" type="primary" size="medium" @click="testCronjobMailing" :loading="loading" :disabled="true">
            <i class="icon-download"></i>
            {{ $t('SW_TEST_CRONJOB_MAILING') }}
          </el-button>
        </div>

        <div></div>
      </masonry>
    </section>

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
      loading: false
    }
  },

  methods: {
    testTemplateMailing () {
      if (this.loading) return
      this.loading = true

      this.$http.get('messages/test-templates')
        .then((res) => {
          this.$message({ type: 'success', message: this.$i18n.t('SW_TEST_MAILING_DONE') })
        })
        .catch(() => {
          this.$message({ message: this.$i18n.t('SW_GENERIC_ERROR'), type: 'error' })
        })
        .finally(() => { this.loading = false })
    },
    testCronjobMailing () {
      if (this.loading) return
      this.loading = true

      this.$http.get('messages/test-templates')
        .then((res) => {
          this.$message({ type: 'success', message: this.$i18n.t('SW_TEST_MAILING_DONE') })
        })
        .catch(() => {
          this.$message({ message: this.$i18n.t('SW_GENERIC_ERROR'), type: 'error' })
        })
        .finally(() => { this.loading = false })
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
  @import '../../../../src/styles/logo-animation.scss';
</style>
