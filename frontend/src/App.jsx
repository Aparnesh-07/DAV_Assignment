import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Overview from './pages/Overview';
import ExplorePatterns from './pages/ExplorePatterns';
import TableauDashboards from './pages/TableauDashboards';
import WeatherPrediction from './pages/WeatherPrediction';
import Methodology from './pages/Methodology';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'patterns':
        return <ExplorePatterns />;
      case 'tableau':
        return <TableauDashboards />;
      case 'prediction':
        return <WeatherPrediction />;
      case 'methodology':
        return <Methodology />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="app-layout">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {renderActivePage()}
      </main>
      <footer className="footer">
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 24px' }}>
          <strong>AtmosIQ</strong> &bull; Indian Weather Intelligence Platform
          <span style={{ margin: '0 8px', color: 'var(--border-card)' }}>|</span>
          <span style={{ color: 'var(--text-muted)' }}>Historical Weather Data (2010–2019)</span>
        </div>
      </footer>
    </div>
  );
}
