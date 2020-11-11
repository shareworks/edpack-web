<template>
  <div>
    <!-- Title -->
    <h1>{{ title }}</h1>

    <div class="header-text mt-5 hidden-xs hidden-sm">

      <!-- Area info -->
      <span v-if="area">
        <strong>
          <i v-if="icon" :class="icon"></i>
          <span>{{ area }}</span>
        </strong>
        &centerdot;
      </span>

      <!-- Show instructors -->
      <span v-if="$slots.members">
        <slot name="members"></slot>
        &centerdot;
      </span>

      <!-- Show participants -->
      <span v-if="$slots.participants">
        <slot name="participants"></slot>
        &centerdot;
      </span>

      <!-- Intro text -->
      <span>{{ intro }}</span>

      <!-- Show more link -->
      <a v-if="!showMore && $slots.default"  href="#" @click.prevent="moreInfo" class="hidden-xs ml-5 bold">
        {{ $t('SW_MORE_INFO') }}
      </a>

      <!-- Detailed text -->
      <el-collapse-transition>
        <div v-show="showMore">
          <slot></slot>
          <a href="#" @click.prevent="moreInfo" class="bold">{{ $t('SW_LESS') }}</a>
        </div>
      </el-collapse-transition>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageHeader',
  props: ['title', 'intro', 'icon', 'area'],

  data () {
    return {
      showMore: false
    }
  },

  methods: {
    moreInfo () {
      this.showMore = !this.showMore
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
