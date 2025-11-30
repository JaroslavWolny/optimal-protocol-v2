import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HabitsProvider } from './context/HabitsContext'
import { AudioProvider } from './context/AudioContext'
import { NotificationProvider } from './context/NotificationContext'
import { ToastProvider } from './context/ToastContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <HabitsProvider>
        <NotificationProvider>
          <AudioProvider>
            <App />
          </AudioProvider>
        </NotificationProvider>
      </HabitsProvider>
    </ToastProvider>
  </StrictMode>,
)
