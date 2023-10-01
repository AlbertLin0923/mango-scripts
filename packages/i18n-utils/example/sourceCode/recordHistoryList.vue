<!-- translateModules:["排查系统vue版"] -->
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
        <el-table-column
          :label="$t('序号')"
          type="index"
          align="center"
          width="180"
        />
        <el-table-column
          :label="$t('变更时间')"
          prop="last_update_time"
          align="center"
          width="240"
        >
          <template slot-scope="scope">
            {{ scope.row.last_update_time | formatDate }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="pageFrom === 'manual'"
          :label="$t('登记人')"
          prop="last_updator"
          align="center"
          width="250"
        />
        <el-table-column
          v-if="pageFrom === 'system'"
          :label="$t('监控人')"
          prop="last_updator"
          align="center"
          width="250"
        />
        <el-table-column
          :label="$t('案件状态')"
          prop="status"
          align="center"
          width="200"
        >
          <template slot-scope="scope">
            {{ $t(caseStatusDictMap.get(scope.row.status)) }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('操作')"
          align="center"
          fixed="right"
          min-width="140"
        >
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="linkDetail(scope.row)">
              {{ $t('查看') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          v-if="tableDataLen"
          :total="tableDataLen"
          :current-page="tablePagination.pages"
          :page-sizes="[5, 10, 20]"
          :page-size="tablePagination.pagesize"
          :pager-count="5"
          background
          layout="total, sizes, prev, pager, next"
          @size-change="sizeChange"
          @current-change="changePage"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import * as Api from '@/api/troubleshoot'
import { caseStatusDictMap } from './dict'

export default {
  name: '',
  data() {
    return {
      caseStatusDictMap,
      pageFrom: '',
      searchOptions: {
        order_no: this.orderNo,
      },
      tablePagination: {
        pages: 1,
        pagesize: 5,
      },
      tableData: [],
      tableLoading: false,
      tableDataLen: 0,
    }
  },
  watch: {},
  created() {
    this.searchOptions.order_no = this.$route.query.order_no
    this.pageFrom = this.$route.query.pageFrom

    this.getHistoryList()
  },
  methods: {
    changePage(page) {
      this.tablePagination.pages = parseInt(page)
      this.getHistoryList()
    },
    sizeChange(pagesize) {
      this.tablePagination = {
        pages: 1,
        pagesize,
      }
      this.getHistoryList()
    },
    async getHistoryList() {
      this.tableLoading = true
      const params = { ...this.searchOptions, ...this.tablePagination }
      const formData = new FormData()
      Object.entries(params).forEach(([key, value]) =>
        formData.append(key, value),
      )
      const { success, errMsg, data, ...rest } = await Api.api_history(formData)
      this.tableLoading = false
      if ([true, 'true'].includes(success)) {
        this.tableDataLen = data.total_count
        this.tableData = data.list
      } else {
        this.$message.error(errMsg)
      }
      return { success, errMsg, ...rest }
    },
    linkDetail(row) {
      const order_no = row.order_no
      const order_id = row.id
      this.$router.push({
        name: 'RecordHistoryDetail',
        query: {
          order_no,
          order_id,
          pageFrom: this.pageFrom,
        },
      })
    },
  },
}
</script>
<style lang="less" scoped>
.status-bar {
  width: 100%;
  height: 40px;
  font-size: 14px;
  margin-bottom: 25px;
  display: flex;
  justify-content: flex-start;
  .goback-icon {
    width: 13px;
    height: 13px;
    display: inline-block;
    vertical-align: top;
    line-height: 1;
  }
}
</style>
