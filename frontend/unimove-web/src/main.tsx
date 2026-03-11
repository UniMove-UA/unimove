import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Update from './update_profile.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Update />
  </StrictMode>,
)
