import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const hostname = typeof window === 'undefined' ? '' : window.location.hostname
const shouldRenderVercelInsights = hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname !== '::1'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {shouldRenderVercelInsights && (
      <>
        <Analytics />
        <SpeedInsights />
      </>
    )}
  </StrictMode>,
)
