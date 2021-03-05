<template>
  <section class="text-center">
    <!-- QR code -->
    <qrcode-vue :value="link" :size="300" level="H"/>

    <!-- instruction -->
    <p class="mt-10 mb-10">{{ $t('SW_QR_INSTRUCTION') }}</p>

    <!-- Input with link -->
    <el-form>
      <el-form-item>
        <el-input v-model="value" :readonly="true" type="url">
          <el-tooltip slot="prepend" :visible-arrow="false" :open-delay="300" :enterable="false" :content="$t('SW_COPY_TO_CLIPBOARD')" placement="bottom-start">
            <el-button v-clipboard="value" @success="clipboardSuccess">
              <i class="icon-copy"/>
            </el-button>
          </el-tooltip>
        </el-input>
      </el-form-item>
    </el-form>
  </section>
</template>

<script>
import QrcodeVue from 'qrcode.vue'
export default {
  name: 'QrCode',
  props: ['link'],
  components: { QrcodeVue },
  methods: {
    clipboardSuccess () { this.$message({ message: this.$i18n.t('SW_COPIED_TO_CLIPBOARD'), type: 'success' }) }
  }
}
</script>
