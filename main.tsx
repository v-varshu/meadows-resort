import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('The Meadows Resort Root Boundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', backgroundColor: '#050708', color: '#F2E9D8', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
          <div style={{ color: '#D4B47A', fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 600 }}>
            THE MEADOWS RESORT · KODAIKANAL
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2.25rem', marginBottom: '1rem', color: '#F2E9D8' }}>
            Mountain Sanctuary Experience
          </h1>
          <p style={{ maxWidth: '480px', color: '#C5D1D0', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            A temporary display initialization occurred. Please refresh to load the serene mountain sanctuary.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ padding: '0.75rem 1.75rem', backgroundColor: '#D4B47A', color: '#050708', border: 'none', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            Reload Sanctuary
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  );
}

