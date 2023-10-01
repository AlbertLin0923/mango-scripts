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
        <el-table-column
          :label="$t('序号')"
          type="index"
          align="center"
          width="180"
        />
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
      pageFrom: '列表页',
    }
  },
  watch: {},
  created() {
    this.getHistoryList('历史记录')
    this.getPageData(`页面数据`)
    console.log('输出列表数据')

    const getFilterStatusMap = (statusMap, type) => {
      if (type === 'pendingCase') {
        return statusMap.filter((i) => {
          return (
            // 这种注释引擎会忽略提取中间包裹的代码段中的中文key
            // translate-disable
            i.text === '易烊千玺' || i.text === '张杰'
            // translate-disable
          )
        })
      } else if (type === 'allCase') {
        return statusMap.filter((i) => {
          return (
            // 下面注释引擎会忽略提取 下一行 代码的中文key
            // translate-disable-next-line
            i.text === '周杰伦' || i.text === '林俊杰' || i.text === '王力宏'
          )
        })
      } else if (type === 'myCase') {
        return statusMap.filter((i) => {
          return (
            // 下面注释引擎会忽略提取 当前行 代码的中文key
            i.text === '林更新' || // translate-disable-line
            i.text === '刘德华'
          )
        })
      } else {
        return statusMap
      }
    }

    getFilterStatusMap()
  },
  methods: {
    change() {
      const data = {
        page: '详情页',
        system: '排查系统',
      }
      this.info = data
    },
  },
}
</script>
