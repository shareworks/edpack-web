<template>
  <div>
    <!-- Open Credits dialog -->
    <el-button :type="buttonColor" size="mini" @click="toggleCreditsDialog()" v-if="['staff', 'admin'].includes(scope.role)">
      <i class="icon-done_all"/>
      <strong v-if="scope.credits.isNew || isOverdue(scope)">0</strong>
      <strong v-else>{{ scope.credits && scope.credits.used > scope.credits.limit ? 0 : scope.credits.limit - scope.credits.used }}</strong>
    </el-button>
    <span v-else class="text-muted">-</span>

    <!-- Pay as you go dialog -->
    <el-dialog :visible.sync="creditsDialog" destroy-on-close>
      <credits-edit :user="scope" :closeDialog="toggleCreditsDialog"/>
    </el-dialog>
  </div>
</template>

<script>
import CreditsEdit from '../../components/CreditsEdit'
import moment from 'moment'

export default {
  name: 'CreditsColumn',
  props: ['scope', 'updateUser'],
  components: { CreditsEdit },

  data () {
    return {
      creditsDialog: false
    }
  },

  computed: {
    buttonColor () {
      if (this.isOverdue(this.scope) || !this.scope.credits) return 'danger'
      if (this.scope.credits.used >= this.scope.credits.limit) return 'danger'
      return 'success'
    }
  },

  methods: {
    isOverdue (user) {
      return user.credits && user.credits.exp && (moment(user.credits.exp) < moment(new Date()))
    },
    toggleCreditsDialog (updatedUser) {
      this.creditsDialog = !this.creditsDialog
      if (updatedUser) this.updateUser(updatedUser._id, updatedUser)
    }
  }
}
</script>
