<!-- translateModules:["DEMO模块"] -->
<template>
  <div class="app-container">
    <div>
      <div class="status-bar">
        <el-button type="primary" @click="$router.go(-1)">
          <img src="./images/goback.svg" alt srcset class="goback-icon" />
          {{ $t('返回') }}
        </el-button>
      </div>
      <el-table
        v-loading="tableLoading"
        :data="tableData"
        border
        tooltip-effect="light"
        class="fix-el-table-style"
      >
        <el-table-column :label="$t('序号')" type="index" align="center" width="180" />
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  name: '',
  data() {
    return {
      caseStatusDictMap,
      pageFrom: '列表页'
    }
  },
  watch: {},
  created() {
    this.getHistoryList('历史记录')
  },
  methods: {
    change() {
      const data = {
        page: '详情页',
        system: '排查系统'
      }
      this.info = data
    }
  }
}
</script>
