(function ($R) {
  $R.add('plugin', 'myplugin', {
    translations: {
      en: {
        myplugin: 'Images'
      }
    },
    init: function (app) {
      // define app
      this.app = app

      // define services
      this.lang = app.lang
      this.toolbar = app.toolbar
    },
    start: function () {
      // create the button data
      var buttonData = {
        title: this.lang.get('myplugin'),
        api: 'plugin.myplugin.toggle'
      }

      // create the button
      var $button = this.toolbar.addButton('myplugin', buttonData)
      $button.setIcon('<i class="re-icon-image"></i>')
    },
    toggle: function () {
      const self = this.app
      this.app.callback.callbacks.openFilestack[0](function (files) {
        if (!files.filesUploaded || !files.filesUploaded.length) return

        const file = files.filesUploaded[0]
        const isImage = file.mimetype.includes('image')
        const data = {}
        data[file.key] = {
          id: file.key,
          url: file.url
        }

        if (isImage) self.module.image.insert(data)
        self.insert.html('<img src="' + file.url + '" alt="' + file.filename + '" />', false)
      })
    }
  })
})(Redactor)
