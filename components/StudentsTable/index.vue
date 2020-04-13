<template>
  <div>
    <!-- Table with students -->
    <el-table v-show="tableData.length" size="small" :data="tableData" row-key="_id" ref="studentsTable">
      <!-- Name -->
      <el-table-column :label="$t('SW_STUDENT')" prop="name" min-width="160">
        <template slot-scope="props">
          <div class="text-ellipsis">
            <strong>{{props.row.name}}</strong>
          </div>
        </template>
      </el-table-column>
      <!-- Email address -->
      <el-table-column property="email" :label="$t('SW_EMAIL')" min-width="180">
        <template slot-scope="props">
          <a :href="'mailto:' + props.row.email" target="_blank" class="text-ellipsis">{{ props.row.email }}</a>
        </template>
      </el-table-column>
      <!-- Group name -->
      <el-table-column property="groupName" :label="$t('SW_GROUP')" min-width="180">
        <template slot-scope="props">
          <strong>{{props.row.groupName}}</strong>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination class="text-center" background layout="prev, pager, next" :total="total" :page-size="10"></el-pagination>
  </div>
</template>

<script>

export default {
  name: 'StudentsTable',
  props: ['closeDialog', 'tableData'],
  components: {},

  data () {
    return {
      course: this.$store.state.course,
      status: false,
      total: 0
    }
  },

  mounted () {
  },

  methods: {
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
