// translateModules:["DEMO模块"]
import React, { useState } from 'react'

export function Example() {
  const [count, setCount] = useState(0)
  const [info, setInfo] = useState('早上好')

  console.log('执行管理员设置')
  console.log(`开始管理员设置`)

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
