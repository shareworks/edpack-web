<template>
  <div class="thumbnail" :class="colorId"
       :style="{'background-image': 'url(' + thumbUrl + ')',
                'color': textColor ? textColor: '#fff',
                'border': borderColor ? `1px solid ${borderColor}` : null
  }">
    <span v-if="!thumbUrl">{{ initials }}</span>
  </div>
</template>

<script>
import getColorId from '../../utils/get-color-id'

export default {
  name: 'Thumbnail',
  props: ['model', 'borderColor', 'textColor'],

  computed: {
    thumbUrl () {
      if (!this.model) return false
      if (this.model.thumbnailUrl) return this.model.thumbnailUrl
      if (this.model.logoUrl) return this.model.logoUrl
      if (this.model.toolLogoUrl) return this.model.toolLogoUrl
      if (typeof this.model === 'string') return this.model
      return false
    },
    initials () {
      if (!this.model.name || this.model.thumbnailUrl) return

      const cleanName = this.model.name.replace(/\s*\(.*?\)\s*/g, '').replace(/\@.*/, '')
      const names = cleanName.split(/[\s.]+/)

      let initials = names[0].substring(0, 1).toUpperCase()

      if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase()
      }

      return initials
    },
    colorId () {
      if (!this.model._id || this.model.thumbnailUrl) return
      return getColorId(this.model._id)
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
