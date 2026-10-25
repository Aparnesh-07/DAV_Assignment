import React, { useState } from 'react';
import {
  ExternalLink,
  ShieldAlert,
  CloudSun
} from 'lucide-react';

const DASHBOARDS_CONFIG = [
  {
    id: 'dashboard-1',
    tabLabel: 'Weather Overview & Trends',
    title: 'India Weather Overview & Climate Trends',
    description: 'National multi-year climatological overview featuring geographic weather mapping, decadal temperature trends, and seasonal rainfall distributions.',
    url: 'https://public.tableau.com/views/dashboard_1_DAV_assign_/Dashboard1',
    kpiHighlights: [
      { label: 'Observations', value: '182,600' },
      { label: 'Precipitation Sum', value: '560,915 mm' },
      { label: 'Avg Max Temperature', value: '31.0 °C' }
    ]
  },
  {
    id: 'dashboard-2',
    tabLabel: 'Urban Risk & Disaster Management',
    title: 'Urban Risk & Disaster Management',
    description: 'Vulnerability assessment analyzing climate extremes, heavy rain & wind risk matrices, and temperature range extremes across 50 Indian cities.',
    url: 'https://public.tableau.com/views/dashboard_2_DAV_assign_/UrbanRiskDisasterManagement',
    kpiHighlights: [
      { label: 'Avg Max Wind', value: '14.0 km/h' },
      { label: 'Extreme Events Flagged', value: '2,599' },
      { label: 'Total Rain Volume', value: '11,218 mm' }
    ]
  }
];

function cleanTableauUrl(rawUrl) {
  if (!rawUrl) return '';
  const baseUrl = rawUrl.split('?')[0];
  return `${baseUrl}?:embed=yes&:showVizHome=no&:toolbar=yes&:showShareOptions=true`;
}

export default function TableauDashboards() {
  const [selectedDashboard, setSelectedDashboard] = useState(DASHBOARDS_CONFIG[0]);
  const [embedLoading, setEmbedLoading] = useState(true);

  const handleSelectDashboard = (dash) => {
    setSelectedDashboard(dash);
    setEmbedLoading(true);
  };

  const embedSrc = cleanTableauUrl(selectedDashboard.url);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tableau Dashboards</h1>
          <p className="page-desc">
            Interactive visual dashboards exploring decadal climate patterns and urban risk across India.
          </p>
        </div>
      </div>

      {/* Switcher Tabs */}
      <div className="subtabs">
        {DASHBOARDS_CONFIG.map((dash) => (
          <button
            key={dash.id}
            className={`subtab-btn ${selectedDashboard.id === dash.id ? 'active' : ''}`}
            onClick={() => handleSelectDashboard(dash)}
          >
            {dash.tabLabel}
          </button>
        ))}
      </div>

      {/* Dashboard Card Header */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="card-title" style={{ fontSize: '1.15rem' }}>
              {selectedDashboard.id === 'dashboard-1' ? (
                <CloudSun size={18} color="var(--primary)" />
              ) : (
                <ShieldAlert size={18} color="#0F766E" />
              )}
              {selectedDashboard.title}
            </div>
            <div className="card-subtitle" style={{ maxWidth: 780, marginBottom: 0, marginTop: 2 }}>
              {selectedDashboard.description}
            </div>
          </div>

          <a
            href={selectedDashboard.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <ExternalLink size={13} />
            Open on Tableau
          </a>
        </div>

        {/* KPI Mini-Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
          {selectedDashboard.kpiHighlights.map((kpi, idx) => (
            <div key={idx} style={{ background: '#F8FAFC', padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
                {kpi.label}
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {kpi.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Embedded Tableau Container */}
      <div className="card" style={{ padding: 8, minHeight: 780, position: 'relative' }}>
        {embedLoading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255, 255, 255, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div className="spinner"></div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8 }}>
              Loading interactive dashboard...
            </p>
          </div>
        )}

        <iframe
          key={embedSrc}
          src={embedSrc}
          title={selectedDashboard.title}
          width="100%"
          height="780px"
          style={{ border: 'none', borderRadius: 'var(--radius-sm)' }}
          onLoad={() => setEmbedLoading(false)}
        />
      </div>
    </div>
  );
}
