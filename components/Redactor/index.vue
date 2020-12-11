<template>
    <textarea ref="redactor" :name="name" :placeholder="placeholder" :value="value"/>
</template>

<script>
import config from 'config'
import Vue from 'vue'
import $script from 'scriptjs'
import convertDiacritics from '../../utils/convert-diacritics'
import * as filestack from 'filestack-js'

export default {
  name: 'Redactor',
  redactor: false,
  props: {
    value: {
      default: '',
      type: String
    },
    placeholder: {
      type: String,
      default: null
    },
    name: {
      type: String,
      default: null
    },
    config: {
      type: Object
    }
  },

  data () {
    return {
      editorOptions: {},
      filepicker: filestack.init(config.filestack.key)
    }
  },
  watch: {
    value (newValue, oldValue) {
      if (!this.redactor.editor.isFocus()) this.redactor.source.setCode(newValue)
    }
  },

  mounted () {
    // Load script
    $script('/redactor/redactor.min.js', () => {
      $script([
        '/redactor/plugins/video/video.js',
        '/redactor/plugins/limiter/limiter.js',
        '/redactor/plugins/filestack.js'
      ], 'redactor-bundle', () => {
        this.init()
      })
    })
  },

  methods: {
    init () {
      const self = this
      var callbacks = {
        changed: (html) => {
          this.handleInput(html)
          return html
        },
        openFilestack: (done) => {
          const customSettings = {
            accept: ['image/*'],
            imageMax: [1000, 1000],
            maxFiles: 1,
            transformations: { crop: true, rotate: true },
            onFileSelected: (file) => {
              file.name = convertDiacritics(file.filename.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_')
              return file
            },
            onFileUploadFailed: (file, err) => self.onError(err),
            onUploadDone: (files) => done(files)
          }

          const settings = Object.assign(config.filestack.default_settings, customSettings)
          this.filepicker.picker(settings).open()
        }
      }

      const options = Object.assign({
        formatting: ['p', 'blockquote', 'pre', 'h1', 'h2', 'h3'],
        minHeight: '100px',
        plugins: ['video', 'myplugin'],
        toolbar: true,
        pasteLinkTarget: '_blank',
        imageEditable: true,
        imageResizable: true,
        lang: 'en',
        imageFigure: true,
        imagePosition: true,
        linkNewTab: true,
        buttons: ['format', 'bold', 'italic', 'lists', 'image', 'link'],
        buttonsHideOnMobile: ['image', 'video']
      }, this.config)

      // extend config
      Vue.set(options, 'callbacks', callbacks)

      // call Redactor
      // eslint-disable-next-line no-undef
      var app = $R(this.$refs.redactor, options)

      // set instance
      this.redactor = app
      this.$parent.redactor = app
    },
    handleInput (val) {
      this.$emit('input', val)
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
