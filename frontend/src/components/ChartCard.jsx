import React from 'react';
import Plot from 'react-plotly.js';

export default function ChartCard({ title, subtitle, data, layout, config, controls, height = 360 }) {
  const mergedLayout = {
    autosize: true,
    height: height,
    margin: { l: 50, r: 25, t: 30, b: 45 },
    paper_bgcolor: '#FFFFFF',
    plot_bgcolor: '#FFFFFF',
    font: {
      family: 'Plus Jakarta Sans, sans-serif',
      color: '#334155',
      size: 11
    },
    hoverlabel: {
      bgcolor: '#0F172A',
      font: { color: '#FFFFFF', family: 'Plus Jakarta Sans, sans-serif' }
    },
    ...layout
  };

  const defaultConfig = {
    displayModeBar: false,
    responsive: true,
    ...config
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div className="card-title">{title}</div>
          {subtitle && <div className="card-subtitle" style={{ marginBottom: 0 }}>{subtitle}</div>}
        </div>
        {controls && <div>{controls}</div>}
      </div>

      <div style={{ width: '100%', minHeight: height }}>
        <Plot
          data={data}
          layout={mergedLayout}
          config={defaultConfig}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
        />
      </div>
    </div>
  );
}
