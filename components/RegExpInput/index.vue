<template>
  <el-input v-model="form[propName]" :autofocus="autofocus" ref="name" :placeholder="$t(placeholder)" @input="validateValue"/>
</template>

<script>
export default {
  name: 'RegExpInput',
  props: ['form', 'propName', 'autofocus', 'regExp', 'replace', 'placeholder'],

  mounted () {
    if (this.autofocus) this.$nextTick(() => this.$refs.name.focus())
  },

  data () {
    return {
      regularExpresion: new RegExp(this.regExp || '^[^<>{}\"/|;:.,~!?@#$%^=&*\\]\\\\()\\[¿§«»ω⊙¤°℃℉€¥£¢¡®©_+]*$')
    }
  },

  methods: {
    validateValue () {
      const value = [...this.form[this.propName]]
      const result = value.map(char => this.regularExpresion.test(char) ? char : '')
      this.form[this.propName] = result.join('')
    }
  }
}
</script>
