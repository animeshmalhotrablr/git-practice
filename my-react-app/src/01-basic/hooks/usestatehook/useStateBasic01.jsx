import React from 'react'
import { useState } from 'react'

function useStateBasic01() {
  const [counter, setCounter] = useState(0)
  return (
    <section>
      <h1>useState hook sample</h1>
      <p>Count: {counter}</p>
      <button onClick={() => setCounter(counter + 1)}>Increment</button>
    </section>
  )
}

export default useStateBasic01
