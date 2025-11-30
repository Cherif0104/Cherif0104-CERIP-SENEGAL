import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { logger } from './utils/logger'
import { LoadingState } from './components/common/LoadingState'
import './styles/globals.css'

// Initialiser le système de logs
logger.info('APP', 'Application démarrée')
logger.loadFromStorage()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<LoadingState message="Chargement de l'application..." />}>
      <RouterProvider router={router} />
    </Suspense>
  </StrictMode>,
)

