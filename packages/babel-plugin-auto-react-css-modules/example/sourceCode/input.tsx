import React from 'react'

import './styles.module.scss'
import './index.module.less'

const _getMatcher = () => {}

const _macther = () => {}

const getClassName = (str: string) => {
  return str + 'name'
}

const myClassName = 'world'

const Example = ({ customerClassName }) => (
  <div>
    <div className="module-class-name">Example</div>
    <div className={customerClassName}>Example</div>
    <div className={getClassName('hello')}>Example</div>
    <div className={`${getClassName('hello')}`}>Example</div>
    <div className={`${myClassName}`}>Example</div>
    <div className={``}>Example</div>
  </div>
)
