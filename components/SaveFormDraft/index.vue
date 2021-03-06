<template>
  <div>
    <el-alert v-if="notFinishedFormDialog" :title="$t('SW_CONTINUE_LAST_EDITING') + (formName)" class="small-dialog" append-to-body @close="declineUsingOldData">
      <div v-if="lastUsedValues">
        <p class="mb-10">{{ $t('SW_NOT_FINISHED_FORM_EXIST') }}</p>
        <!-- Created date -->
        <p><strong>{{ $t('SW_CREATED_DATE') }}:</strong> {{ showDate(lastUsedValues.createdDate) }}</p>
      </div>

      <div class="mt-10">
        <el-button type="primary" class="mr-5" @click="acceptUsingOldData">{{ $t('SW_USE_DRAFT') }}</el-button>
        <el-button type="text" @click="declineUsingOldData">{{ $t('SW_DISCARD') }}</el-button>
      </div>
    </el-alert>
  </div>
</template>

<script>

import moment from 'moment'
import copyObjectProps from '@/edpack-web/utils/copy-object-props'

export default {
  name: 'SaveFormDraft',
  props: ['propertiesToBeCopied', 'localStorageKey', 'form', 'useWorkflow', 'useLanguage', 'nameProp'],

  computed: {
    formName () {
      return this.useLanguage
        ? this.lastUsedValues[this.nameProp || 'name'][this.lang]
        : this.lastUsedValues[this.nameProp || 'name']
    }
  },

  watch: {
    form: {
      deep: true,
      handler () {
        // check that localStorage exist
        if (window.self !== window.top) return
        if (this.form.isNew) this.syncFormLocalStorage()
        if (this.useWorkflow && this.form.workflowStatus === 'none') this.syncFormLocalStorage()
      }
    }
  },

  data () {
    return {
      lastUsedValues: null,
      lang: this.$store.state.lang,
      notFinishedFormDialog: false
    }
  },

  created () {
    // check that localStorage exist
    if (window.self !== window.top) return

    const lastUsedFormValues = localStorage.getItem(this.localStorageKey)

    // if values exist more than 30 days - remove them
    const createdDate = JSON.parse(lastUsedFormValues)?.createdDate
    if (createdDate && moment(createdDate).diff(new Date(), 'days') > 30) {
      localStorage.removeItem(this.localStorageKey)
    }
  },

  mounted () {
    // check that localStorage exist
    if (window.self !== window.top) return

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
      this.$message({ message: this.$i18n.t('SW_DRAFT_RESTORED'), type: 'success' })
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
      formObject.createdDate = new Date()
      localStorage.setItem(this.localStorageKey, JSON.stringify(formObject))
    },
    showDate (date) { return moment(date).format('lll') }
  }
}
</script>
