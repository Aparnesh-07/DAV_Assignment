import React from 'react';
import { CloudSun, Network, LayoutDashboard, Cpu, BookOpen } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: CloudSun },
    { id: 'patterns', label: 'Weather Patterns', icon: Network },
    { id: 'tableau', label: 'Tableau Dashboards', icon: LayoutDashboard },
    { id: 'prediction', label: 'Prediction', icon: Cpu },
    { id: 'methodology', label: 'Methodology', icon: BookOpen },
  ];

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="brand-wrapper" onClick={() => setActiveTab('overview')}>
          <div className="brand-icon">
            <CloudSun size={20} />
          </div>
          <div>
            <div className="brand-title">AtmosIQ</div>
            <div className="brand-subtitle">Indian Weather Intelligence</div>
          </div>
        </div>

        <nav>
          <ul className="nav-links">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    className={`nav-item-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
