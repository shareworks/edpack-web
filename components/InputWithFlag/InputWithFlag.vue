<template>
  <el-input ref="element" :placeholder="placeholder" @change="onChange" :name="name" :id="id" size="medium" maxlength="200" v-model="data">
    <template v-if="!isJustOneLanguage" slot="prepend"><img :src="`/images/${lang}.png`" class="language-icon" alt="language-icon"></template>
  </el-input>
</template>

<script>
export default {
  name: 'InputWhitFlag',
  props: ['form', 'lang', 'name', 'id', 'change', 'value', 'placeholder', 'isAutofocus'],

  data () {
    return {
      data: this.value
    }
  },

  mounted () {
    if (this.isAutofocus) { this.$nextTick(() => this.$refs.element.focus()) }
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
