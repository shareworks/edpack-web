<template>
  <div>
    <el-alert v-if="notFinishedFormDialog" class="small-dialog" :title="$t('SW_CONTINUE_LAST_EDITING')" append-to-body>
      <div v-if="lastUsedValues">
        <p>{{ $t('SW_NOT_FINISHED_FORM_EXIST') }}</p>
        <!-- Last used name -->
        <p><strong>{{ $t('SW_NAME') }}:</strong> {{ lastUsedValues.name }}</p>
        <!-- Last used started date -->
        <p><strong>{{ $t('SW_STARTEND_DATE') }}:</strong> {{ lastUsedValues.startDate }}</p>
        <!-- Last used end date -->
        <p><strong>{{ $t('SW_UNTIL_DATE') }}:</strong> {{ lastUsedValues.endDate }}</p>
      </div>

      <div class="mt-10">
        <el-button type="primary" class="mr-5" @click="acceptUsingOldData">{{ $t('SW_ACCEPT') }}</el-button>
        <el-button type="text" @click="declineUsingOldData">{{ $t('SW_CANCEL') }}</el-button>
      </div>
    </el-alert>
  </div>
</template>

<script>

import copyObjectProps from '@/edpack-web/utils/copy-object-props'

export default {
  name: 'SaveFormDraft',
  props: ['propertiesToBeCopied', 'localStorageKey', 'form', 'useWorkflow'],

  watch: {
    form: {
      deep: true,
      handler () {
        if (this.form.isNew) this.syncFormLocalStorage()
        if (this.useWorkflow && this.form.workflowStatus === 'none') this.syncFormLocalStorage()
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

    const formNewAndHasPreviousData = this.form.isNew && !!lastUsedFormValues
    const useWorkflowLogic = this.useWorkflow && this.form.workflowStatus === 'none' && !!lastUsedFormValues

    if (formNewAndHasPreviousData || useWorkflowLogic) {
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
