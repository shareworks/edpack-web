<template>
  <div class="mt-30 text-muted text-center">
    <!-- Loading -->
    <spinner v-if="status === 'loading'"></spinner>

    <!-- Error -->
    <span v-if="status === 'error'">{{ $t('SW_ERROR_LOADING') }}</span>

    <!-- None -->
    <span v-if="status === 'none'">{{ noneText }}</span>

    <!-- No results -->
    <div v-if="status === 'noResults'">
      {{ $t('SW_NO_MATCH_FOUND') }}
      <el-button type="text" @click="clearSearch">{{ $t('SW_CLEAR_SEARCH') }}</el-button>
    </div>

    <!-- Incomplete -->
    <span v-if="status === 'incomplete'">{{ $t('SW_SCROLL_FOR_MORE') }}</span>
  </div>
</template>

<script>
export default {
  name: 'TableStatus',
  props: ['status', 'noneText'],

  methods: {
    clearSearch () {
      this.$emit('clearSearch')
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
