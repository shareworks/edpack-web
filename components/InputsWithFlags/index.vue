<template>
  <section>
    <!-- Input -->
    <el-input v-for="(language, index) in this.$store.state.languages" :key="language" v-model="value[language]"
              ref="element" :name="`${name}-${language}-name`" :id="`${name}-${language}`" maxlength="200"
              :placeholder="getPlaceholder(index)" @change="onChange" size="medium">

      <!-- Language icon -->
      <template v-if="!isJustOneLanguage" slot="prepend">
        <img :src="`/images/${language}.png`" class="language-icon" alt="language-icon">
      </template>
    </el-input>
  </section>
</template>

<script>
export default {
  name: 'InputsWithFlags',
  props: ['name', 'change', 'value', 'placeholder', 'isAutofocus'],

  mounted () {
    if (this.isAutofocus) { this.$nextTick(() => this.$refs.element[0].focus()) }
  },

  computed: {
    isJustOneLanguage () {
      return this.$store.state.languages.length === 1
    }
  },

  methods: {
    onChange (value) { this.change(this.lang, value) },

    getPlaceholder (index) {
      if (typeof this.placeholder === 'string') return this.placeholder
      if (typeof this.placeholder === 'object') return this.placeholder[index]
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
</style>
