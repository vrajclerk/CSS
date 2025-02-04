import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import TestComponent from './Test'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <TestComponent />
    </>
  )
}

export default App
