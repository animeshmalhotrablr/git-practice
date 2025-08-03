import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
import Basic from './01-basic/hooks/usestatehook/useStateBasic01.jsx'

createRoot(document.getElementById('root')).render(
  <div>
    <Basic />
  </div>
)
