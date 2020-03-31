<template>
  <div>
    <thumbnail :model="form" class="thumb-user thumb-80 pull-left"></thumbnail>
    <div class="picture-stuff">
      <el-button class="mb-5" plain @click="pickFile">
        <i class="icon-camera"></i>
        <span>{{ $t('SW_UPLOAD_PHOTO') }}</span>
      </el-button><br>
      <el-button type="text" :disabled="!form.thumbnailUrl" size="medium" @click="form.thumbnailUrl = ''">
        <i class="icon-delete"></i>
        <span>{{ $t('SW_DELETE') }}</span>
      </el-button>
    </div>
  </div>
</template>

<script>
import config from 'config'
import * as filestack from 'filestack-js'
import convertDiacritics from '@/utils/convert-diacritics'

export default {
  name: 'ThumbnailEdit',
  props: ['form'],

  data () {
    return {
      filepicker: filestack.init(config.filestack.key)
    }
  },

  methods: {
    pickFile () {
      const customSettings = {
        accept: ['image/*'],
        maxFiles: 1,
        transformations: { crop: { force: true, aspectRatio: 1 / 1 } },
        onFileSelected: (file) => {
          file.name = convertDiacritics(file.filename.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_')
          return file
        },
        onFileUploadFailed: (file, err) => this.onError(err),
        onUploadDone: (files) => this.doneUploading(files)
      }

      const settings = Object.assign(config.filestack.default_settings, customSettings)
      this.filepicker.picker(settings).open()
    },
    doneUploading (result) {
      result.filesUploaded.forEach((file) => {
        this.form.thumbnailUrl = file.url
        this.$forceUpdate()
      })
    },
    onError (error) {
      console.error(error.toString())
      this.$message({ message: this.$i18n.t('SW_ERROR_LOADING'), type: 'error' })
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
