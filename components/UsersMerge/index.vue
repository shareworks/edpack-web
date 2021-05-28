<template>
  <div>
    <el-form label-position="top">

      <el-form-item label="Original User Id">
        <el-input type="text" v-model="originalUserId"></el-input>

      </el-form-item>
      <el-form-item label="Target User Id">
        <el-input type="text" v-model="targetUserId"></el-input>
      </el-form-item>

      <el-form-item v-if="originalUser">
        <el-col :span="8">
          <el-card class="box-card" :span="8"  shadow="always">
            <div slot="header" class="clearfix">
              <thumbnail :model="originalUser" class="thumb-user thumb-42 pull-left"></thumbnail>
              <span>{{originalUser.name}}</span>
              <div class="bottom clearfix">
                <span>{{originalUser.email}}</span>
              </div>
            </div>

            <el-table :data="originalUser.courses" row-key="_id" :default-sort="{prop: 'createdDate', order: 'descending'}">
              <el-table-column property="name" :label="$t('SW_COURSE')" min-width="180">
                <template slot-scope="scope">
                  <router-link  :to="{ name: 'staff', params: { course: scope.row._id, slug: school.slug } }" class="block text-ellipsis">
                    <span v-if="scope.row.name">{{ scope.row.name }}</span>
                    <span v-else>-</span>
                    <lms-icon :model="scope.row"></lms-icon>
                  </router-link>
                </template>
              </el-table-column>
              <el-table-column property="role" :label="$t('SW_ROLE')" min-width="110">
                <template slot-scope="scope">
                  <span v-if="scope.row.role === 'student'">{{ school.terminology.student[lang] }}</span>
                  <span v-else-if="scope.row.role === 'participant'">{{ school.terminology.student[lang] }}</span>
                  <span v-else-if="scope.row.role === 'assessor'">{{ $tc('SW_ASSESSOR', 1) }}</span>
                  <span v-else-if="scope.row.role === 'staff'">{{ school.terminology.instructor[lang].toLowerCase() }}</span>
                  <span v-else-if="scope.row.role === 'admin'">{{ $t('SW_ADMIN') }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>

        <el-col :span="3" justify="center">
          <el-button type="primary" round @click="exchange">
            <i class="el-icon-caret-left"></i>
            Merge into
          </el-button>
        </el-col>

        <el-col :span="8">
          <el-card class="box-card"  shadow="never">
            <div slot="header" class="clearfix">
              <thumbnail :model="targetUser" class="thumb-user thumb-42 pull-left"></thumbnail>
              <span>{{targetUser.name}}</span>
              <div class="bottom clearfix">
                <span>{{targetUser.email}}</span>
              </div>
            </div>

            <div v-if="targetUser.courses && targetUser.courses.length">
              <el-table :data="targetUser.courses" row-key="_id" :default-sort="{prop: 'createdDate', order: 'descending'}">
                <el-table-column property="name" :label="$t('SW_COURSE')" min-width="180">
                  <template slot-scope="scope">
                    <router-link  :to="{ name: 'staff', params: { course: scope.row._id, slug: school.slug } }" class="block text-ellipsis">
                      <span v-if="scope.row.name">{{ scope.row.name }}</span>
                      <span v-else>-</span>
                      <lms-icon :model="scope.row"></lms-icon>
                    </router-link>
                  </template>
                </el-table-column>
                <el-table-column property="role" :label="$t('SW_ROLE')" min-width="110">
                  <template slot-scope="scope">
                    <span v-if="scope.row.role === 'student'">{{ school.terminology.student[lang] }}</span>
                    <span v-else-if="scope.row.role === 'participant'">{{ school.terminology.student[lang] }}</span>
                    <span v-else-if="scope.row.role === 'assessor'">{{ $tc('SW_ASSESSOR', 1) }}</span>
                    <span v-else-if="scope.row.role === 'staff'">{{ school.terminology.instructor[lang].toLowerCase() }}</span>
                    <span v-else-if="scope.row.role === 'admin'">{{ $t('SW_ADMIN') }}</span>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </el-col>
      </el-form-item>

    </el-form>
    <div class="mt-20">
      <el-button type="primary" @click="mergeUsers" :loading="loading">
        <strong>{{ $t('SW_MERGE') }}</strong>
      </el-button>
      <el-button type="text" @click="closeDialog(false)">{{ $t('SW_CANCEL') }}</el-button>
    </div>
  </div>
</template>

<script>
import LmsIcon from '../../components/LmsIcon'

export default {
  name: 'UsersMerge',
  props: ['closeDialog', 'selectedUsers'],
  components: { LmsIcon },

  data () {
    return {
      originalUserId: this.selectedUsers[0] ? this.selectedUsers[0]._id : '',
      targetUserId: this.selectedUsers[1] ? this.selectedUsers[1]._id : '',
      user: this.$store.state.user,
      school: this.$store.state.school,
      lang: this.$store.state.lang,
      loading: false,
      originalUser: this.selectedUsers[0],
      targetUser: this.selectedUsers[1],
      mergeTo: 'left'
    }
  },

  methods: {
    exchange () {
      const originalUser = this.originalUser
      this.originalUser = this.targetUser
      this.targetUser = originalUser
      this.originalUserId = this.originalUser ? this.originalUser._id : ''
      this.targetUserId = this.targetUser ? this.targetUser._id : ''
    },

    mergeUsers () {
      if (this.loading) return
      this.loading = true

      const original = this.originalUserId || this.originalUser._id // Original user will stay
      const target = this.targetUserId || this.targetUser._id // Target user will be merged into original (and removed)

      this.$http.put('users/merge', {}, { params: { original, target } })
        .then(() => {
          this.$message({ message: this.$i18n.t('SW_USERS_MERGED'), type: 'success' })
          this.closeDialog(true)
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
        .finally(() => { this.loading = false })
    }
  }
}
</script>
