<template>
  <div>
    <!-- Thumbnail -->
    <thumbnail :model="form" class="thumb-user thumb-80 pull-left"/>
    <div class="picture-stuff">
      <dashboard-modal :uppy="uppy" :props="{theme: 'light', trigger: '.upload-thumbnail-button'}" :open="false" />

      <!-- Upload photo -->
      <el-button class="mb-5" :class="useUppy && 'upload-thumbnail-button'" plain @click="pickFile">
        <i class="icon-camera"/>
        <span>{{ $t('SW_UPLOAD_PHOTO') }}</span>
      </el-button>

      <br>

      <!-- Delete -->
      <el-button type="text" :disabled="!form.thumbnailUrl" size="medium" @click="form.thumbnailUrl = ''">
        <i class="icon-delete"/>
        <span>{{ $t('SW_DELETE') }}</span>
      </el-button>
    </div>
  </div>
</template>

<script>
import Tus from '@uppy/tus'
import Uppy from '@uppy/core'
import config from 'config'
import * as filestack from 'filestack-js'
import { DashboardModal } from '@uppy/vue'
import convertDiacritics from '../../utils/convert-diacritics'

export default {
  name: 'ThumbnailEdit',
  props: ['form'],
  components: { DashboardModal },

  data () {
    return {
      useUppy: false,
      filepicker: filestack.init(config.filestack.key)
    }
  },
  computed: {
    uppy () {
      return new Uppy({
        allowMultipleUploads: false,
        debug: true,
        showProgressDetails: true,
        restrictions: {
          maxTotalFileSize: 2000 * (1024 * 1024),
          maxNumberOfFiles: 1,
          minNumberOfFiles: 1,
          allowedFileTypes: ['image/*']
        }
      })
        .use(Tus, { endpoint: 'https://tusd.tusdemo.net/files/' })
        .on('complete', result => {
          console.log('successful files:', result.successful)
          console.log('failed files:', result.failed)
        })
    }
  },
  beforeDestroy () {
    this.uppy.close()
  },
  methods: {
    pickFile () {
      if (this.useUppy) return

      const customSettings = {
        accept: ['image/*'],
        maxFiles: 1,
        transformations: { crop: { force: true, aspectRatio: 1 } },
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
@import "~@uppy/core/dist/style.min.css";
@import "~@uppy/dashboard/dist/style.min.css";
</style>
