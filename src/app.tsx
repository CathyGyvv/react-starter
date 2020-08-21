import React, { Suspense, useState } from 'react'
import moment from 'moment'
const ComputedOne = React.lazy(() => import('Components/ComputedOne'))
const ComputedTwo = React.lazy(() => import('Components/ComputedTwo'))

function App() {
  const [showTwo, setShowTwo] = useState<boolean>(false)
  let startTime  = moment("2019-06-03").valueOf()
  console.log('startTime', startTime)
  let endTime = moment('2019-06-02').valueOf()
  if(startTime > endTime){
    console.log('时间不能早于2019年6月3日')
  }
  return (
    <div className='app'>
    hello wo
      <Suspense fallback={<div>Loading...</div>}>
        <ComputedOne a={1} b={2} />
        {showTwo && <ComputedTwo a={3} b={4} />}
        <button type='button' onClick={() => setShowTwo(true)}>
          显示Two啊啊啊
        </button>
      </Suspense>
    </div>
  )
}

export default App
