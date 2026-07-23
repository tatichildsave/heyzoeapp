import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import ErrorBoundary from './ErrorBoundary';
import { AuthProvider, ThemeProvider, UserProvider } from './contexts';
import './design-system/globals.css';

const App = lazy(() => import('./App'));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <ErrorBoundary>
            <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading app...</div>}>
              <App />
            </Suspense>
          </ErrorBoundary>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
