import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

import { initGA, initChannelTracking, hasAnalyticsConsent } from './utils/analytics'
import { installChunkReloader } from './utils/chunkReloader'

installChunkReloader();

// Privacy-first analytics: GA is loaded ONLY after the visitor accepts
// analytics cookies via CookieConsent. Returning visitors who already
// accepted will have GA loaded immediately on this boot.
if (hasAnalyticsConsent()) {
    initGA();
    initChannelTracking();
}

import ErrorBoundary from './Components/Shared/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
