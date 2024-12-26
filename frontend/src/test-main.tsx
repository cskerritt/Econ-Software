import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AEFCalculator from './components/AEFCalculator'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <div className="container mx-auto p-4">
        <AEFCalculator />
      </div>
    </BrowserRouter>
  </React.StrictMode>,
)