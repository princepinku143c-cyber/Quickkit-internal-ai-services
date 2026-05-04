import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// 🚨 FINAL EMERGENCY ERROR BOUNDARY
class FinalErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error("🔥 SHUTDOWN ERROR:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ backgroundColor: '#030712', color: '#f8fafc', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'sans-serif' }}>
          <div style={{ maxWidth: '600px', width: '100%' }}>
            <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>⚠️ Application Error</h1>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>A critical error occurred while initializing the application system.</p>
            <div style={{ backgroundColor: '#0f172a', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #1e293b', overflow: 'auto', maxHeight: '50vh' }}>
              <pre style={{ fontSize: '0.75rem', color: '#fca5a5', margin: 0 }}>
                {String(this.state.error)}
              </pre>
            </div>
            <button 
              onClick={() => window.location.reload()}
              style={{ marginTop: '2rem', padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <FinalErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </FinalErrorBoundary>
  </React.StrictMode>
);