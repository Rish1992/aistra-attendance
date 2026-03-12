import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Sync persisted theme to DOM before render
const stored = localStorage.getItem('aistra-hrms-ui-storage')
if (stored) {
  try {
    const parsed = JSON.parse(stored)
    if (parsed?.state?.theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  } catch {}
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
