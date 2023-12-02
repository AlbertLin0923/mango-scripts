import React from 'react'

import './styles.module.scss'

const Example = ({ customerClassName }) => (
  <div>
    <div className="module-class-name">Example</div>
    <div className={customerClassName}>Example</div>
  </div>
)
