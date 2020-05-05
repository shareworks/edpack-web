<template>
  <section>
    <el-input v-for="language in this.$store.state.languages" :key="language" v-model="value[language]" ref="element" :name="`${name}-${language}-name`" :id="`${name}-${language}`" :placeholder="placeholder" @change="onChange" size="medium" maxlength="200">
      <template v-if="!isJustOneLanguage" slot="prepend"><img :src="`/images/${language}.png`" class="language-icon" alt="language-icon"></template>
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
    onChange (value) { this.change(this.lang, value) }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
</style>
