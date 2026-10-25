import React from 'react';
import { AlertCircle } from 'lucide-react';

export function LoadingState({ message = 'Loading weather intelligence data...' }) {
  return (
    <div className="state-container">
      <div className="spinner"></div>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{message}</p>
    </div>
  );
}

export function ErrorState({ message = 'Failed to load data', onRetry }) {
  return (
    <div className="state-container" style={{ color: '#DC2626' }}>
      <AlertCircle size={32} style={{ marginBottom: 12 }} />
      <p style={{ fontWeight: 600, marginBottom: 8 }}>{message}</p>
      {onRetry && (
        <button className="btn btn-outline" onClick={onRetry} style={{ marginTop: 8 }}>
          Retry Request
        </button>
      )}
    </div>
  );
}
