<template>
  <div>
    <!-- Table with students -->
    <el-table v-show="tableValues.length" size="small" :data="getTableData" row-key="_id" ref="studentsTable" class="mb-20">

      <!-- Name -->
      <el-table-column :label="$tc(participantTypeText ? participantTypeText : 'SW_STUDENT', 1)" prop="name" min-width="160">
        <template slot-scope="props">
          <div class="text-ellipsis">
            <el-popover width="200" trigger="click" placement="bottom">
              <el-input size="small" v-model="props.row.name"/>
              <strong class="student-name" slot="reference">{{props.row.name}}</strong>
            </el-popover>
          </div>
        </template>
      </el-table-column>

      <!-- Email address -->
      <el-table-column property="email" :label="$tc('SW_EMAIL', 1)" min-width="180">
        <template slot-scope="props">
          <a :href="'mailto:' + props.row.email" target="_blank" class="text-ellipsis">{{ props.row.email }}</a>
        </template>
      </el-table-column>

      <!-- Group name -->
      <el-table-column v-if="!noGroup" property="groupName" :label="$tc('SW_GROUP', 1)" min-width="180">
        <template slot-scope="props">
          <strong>{{ props.row.groupName }}</strong>
        </template>
      </el-table-column>

      <!-- Group Index -->
      <el-table-column v-if="!noGroup" property="groupName" :label="$t('SW_GROUP_INDEX')" min-width="50">
        <template slot-scope="props">
          <strong>{{ props.row.groupIndex }}</strong>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination class="text-center" background layout="prev, pager, next" :total="total" :page-size="pageSize" @current-change="onPageChange"/>
  </div>
</template>

<script>

export default {
  name: 'StudentsTable',
  props: ['closeDialog', 'tableData', 'noGroup', 'participantTypeText'],

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
