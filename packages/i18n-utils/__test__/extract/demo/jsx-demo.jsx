// translateModules:["DEMO模块"]
import React, { useState } from 'react'

export function Example() {
  const [count, setCount] = useState(0)
  const [info, setInfo] = useState('早上好')

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

  getFilterStatusMap()

  return (
    <div>
      <p>
        You clicked {count} times , {info}
      </p>
      <button onClick={() => setCount(count + 1)}>设置次数</button>
      <button onClick={() => setInfo('下午好')}>设置问候语</button>
    </div>
  )
}
