import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { AuthProvider } from './contexts/AuthContext'; // ✅ ADD THIS
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>   {/* ✅ WRAP APP */}
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
