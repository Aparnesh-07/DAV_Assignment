import React from 'react';

export default function MetricCard({ label, value, unit, subtext, icon: Icon }) {
  return (
    <div className="metric-card">
      <div className="metric-card-label">{label}</div>
      <div className="metric-card-val-row">
        <span className="metric-card-val">{value}</span>
        {unit && <span className="metric-card-unit">{unit}</span>}
      </div>
      {subtext && <div className="metric-card-sub">{subtext}</div>}
    </div>
  );
}
