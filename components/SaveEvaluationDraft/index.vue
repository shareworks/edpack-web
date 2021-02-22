<template>
  <div>
    <el-dialog class="small-dialog" :title="$t('SW_CONTINUE_LAST_EDITING')" append-to-body :visible.sync="notFinishedFormDialog">
      <div v-if="lastUsedValues">
        <p>{{ $t('SW_NOT_FINISHED_ASSESSMENT_EXIST') }}</p>
        <!-- Last used name -->
        <p><strong>{{ $t('SW_NAME') }}:</strong> {{ lastUsedValues.name }}</p>
        <!-- Last used started date -->
        <p><strong>{{ $t('SW_STARTEND_DATE') }}:</strong> {{ lastUsedValues.startDate }}</p>
        <!-- Last used end date -->
        <p><strong>{{ $t('SW_UNTIL_DATE') }}:</strong> {{ lastUsedValues.endDate }}</p>
        ...
      </div>

      <div class="mt-10">
        <el-button type="primary" class="mr-5" @click="acceptUsingOldData">{{ $t('SW_ACCEPT') }}</el-button>
        <el-button type="text" @click="declineUsingOldData">{{ $t('SW_CANCEL') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import copyObjectProps from '@/edpack-web/utils/copy-object-props'

export default {
  name: 'SaveEvaluationDraft',
  props: ['propertiesToBeCopied', 'localStorageKey', 'form'],

  watch: {
    form: {
      deep: true,
      handler () {
        if (this.form.isNew) this.syncFormLocalStorage()
      }
    }
  },

  data () {
    return {
      lastUsedValues: null,
      notFinishedFormDialog: false
    }
  },

  mounted() {
    const lastUsedFormValues = localStorage.getItem(this.localStorageKey)
    if (this.form.isNew && !!lastUsedFormValues) {
      this.notFinishedFormDialog = true

      this.lastUsedValues = {}
      copyObjectProps(this.propertiesToBeCopied, this.lastUsedValues, JSON.parse(lastUsedFormValues))
    }
  },

  methods: {
    acceptUsingOldData () {
      copyObjectProps(this.propertiesToBeCopied, this.form, this.lastUsedValues)
      this.lastUsedValues = null
      this.notFinishedFormDialog = false
    },
    declineUsingOldData () {
      this.lastUsedValues = null
      this.notFinishedFormDialog = false
      localStorage.removeItem(this.localStorageKey)
    },
    syncFormLocalStorage () {
      const formObject = {}
      copyObjectProps(this.propertiesToBeCopied, formObject, this.form)
      localStorage.setItem(this.localStorageKey, JSON.stringify(formObject))
    },
  }
}
</script>
