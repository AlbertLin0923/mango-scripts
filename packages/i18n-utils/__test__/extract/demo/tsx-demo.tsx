/* eslint-disable node/no-missing-import */
// translateModules:["DEMO模块"]
import React from 'react'
import { Modal, Table, Progress } from 'antd'

import { useTranslation } from 'react-i18next'

export type AnalysisModalProps = React.PropsWithChildren<{
  localeDictWithLabel: Array<any>
  filterTableData: Array<any>
  visible: boolean
  onClose: () => void
}>

const AnalysisModal: React.FC<AnalysisModalProps> = (props) => {
  const { t } = useTranslation()
  const { localeDictWithLabel, filterTableData, visible, onClose } = props

  const data = localeDictWithLabel.map((item) => {
    const name = item['value']
    const locale = item['label']
    const all = filterTableData.length
    const finished = filterTableData.filter((i) => {
      return i[name] !== '' && i[name] !== undefined
    }).length

    const finishedPercent = Math.floor((finished / all) * 100)

    const unfinished = filterTableData.filter((i) => {
      return i[name] === '' || i[name] === undefined
    }).length

    return {
      key: locale,
      locale,
      all,
      finished,
      unfinished,
      finishedPercent
    }
  })

  const columns = [
    {
      title: '语言包',
      dataIndex: 'locale',
      key: 'locale'
    },
    {
      title: '总数目',
      dataIndex: 'all',
      key: 'all'
    },
    {
      title: '已翻译',
      dataIndex: 'finished',
      key: 'finished'
    },
    {
      title: '未翻译',
      dataIndex: 'unfinished',
      key: 'unfinished'
    },
    {
      title: '翻译进度',
      dataIndex: 'finishedPercent',
      key: 'finishedPercent',
      render: (text: number) => {
        return <Progress percent={text} />
      }
    }
  ]

  console.log('执行管理员设置')
  console.log(`开始管理员设置`)

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

  getFilterStatusMap([], 'pendingCase')

  return (
    <Modal
      width="50vw"
      title={t('数据统计')}
      visible={visible}
      footer={null}
      maskClosable={false}
      onCancel={() => {
        onClose()
      }}
    >
      <Table columns={columns} dataSource={data} pagination={false} />
    </Modal>
  )
}

export default AnalysisModal
