/* eslint-disable node/no-extraneous-import */

// translate-disable-entire-file
import React, { useState } from 'react'

export function Example() {
  // 声明一个叫 “count” 的 state 变量。
  const [count, setCount] = useState(0)

  console.log('执行管理员设置countryGroupIdList[0]')
  console.log(`执行管理员设置countryGroupIdList[0]`)

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>你好</button>
    </div>
  )
}
