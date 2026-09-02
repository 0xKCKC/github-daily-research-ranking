import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@primer/css/dist/base.css'
import './styles/tokens.css'
import './styles/layout.css'
import './styles/components.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
