<template>
  <div>
    <h3>{{ $t('SW_STUDENTS_TABLE') }}</h3>
    <span>{{ $t('SW_STUDENTS_TABLE_DESCRIPTION') }}</span>
    <!-- Table with students -->
    <el-table v-show="tableValues.length" size="small" :data="getTableData" row-key="_id" ref="studentsTable">
      <!-- Name -->
      <el-table-column :label="$t('SW_STUDENT')" prop="name" min-width="160">
        <template slot-scope="props">
          <div class="text-ellipsis">
            <el-popover width="200" trigger="click" placement="bottom">
              <el-input size="small" v-model="props.row.name"></el-input>
              <strong class="student-name" slot="reference">{{props.row.name}}</strong>
            </el-popover>
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
          <strong>{{ props.row.groupName }}</strong>
        </template>
      </el-table-column>
      <el-table-column property="groupName" :label="$t('SW_GROUP_INDEX')" min-width="50">
        <template slot-scope="props">
          <strong>{{ props.row.groupIndex }}</strong>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination class="text-center" background layout="prev, pager, next" :total="total" :page-size="pageSize" @current-change="onPageChange"></el-pagination>
  </div>
</template>

<script>

export default {
  name: 'StudentsTable',
  props: ['closeDialog', 'tableData'],

  data () {
    return {
      pageSize: 10,
      currentPage: 0,
      tableValues: this.tableData,
      total: this.tableData.length,
      course: this.$store.state.course
    }
  },

  created () {
    let index = 1
    let groupName = ''
    const upgradedTableValues = [...this.tableValues]

    upgradedTableValues.forEach(el => {
      if (groupName !== el.groupName) {
        index = 1
        groupName = el.groupName
        el.groupIndex = index
      } else {
        index++
        el.groupIndex = index
      }
    })

    this.tableValues = upgradedTableValues
  },

  computed: {
    getTableData () {
      const takeValuesFrom = this.pageSize * this.currentPage
      return [...this.tableValues].splice(takeValuesFrom, this.pageSize)
    }
  },

  methods: {
    onPageChange (pageNumber) { this.currentPage = pageNumber - 1 }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
