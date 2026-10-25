import React, { useState, useEffect } from 'react';
import {
  fetchCityProfiles,
  fetchAnomalies,
  fetchPatternDiscovery,
  fetchCities
} from '../services/api';
import ChartCard from '../components/ChartCard';
import { LoadingState, ErrorState } from '../components/LoadingState';
import {
  ArrowRightLeft,
  Sparkles,
  Thermometer,
  CloudRain,
  Wind
} from 'lucide-react';

export default function ExplorePatterns() {
  const [activeSubtab, setActiveSubtab] = useState('profiles'); // 'profiles', 'anomalies', 'discovery'
  const [citiesList, setCitiesList] = useState([]);

  // Subtab 1: Profiles & Comparison
  const [cityA, setCityA] = useState('Delhi');
  const [cityB, setCityB] = useState('Mumbai');
  const [cityC, setCityC] = useState('Bangalore');
  const [comparisonResult, setComparisonResult] = useState(null);

  // Subtab 2: Anomalies
  const [anomalyFilterCity, setAnomalyFilterCity] = useState('All');
  const [anomalyFilterYear, setAnomalyFilterYear] = useState(0);
  const [anomalyFilterType, setAnomalyFilterType] = useState('All');
  const [anomaliesData, setAnomaliesData] = useState(null);

  // Subtab 3: Pattern Discovery
  const [discoveryData, setDiscoveryData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCities()
      .then(cts => setCitiesList(cts))
      .catch(err => console.error(err));
  }, []);

  // Fetch profiles comparison
  useEffect(() => {
    fetchCityProfiles(cityA, cityB, cityC)
      .then(res => setComparisonResult(res))
      .catch(err => setError(err.message));
  }, [cityA, cityB, cityC]);

  // Fetch anomalies
  useEffect(() => {
    fetchAnomalies({
      city: anomalyFilterCity,
      year: anomalyFilterYear,
      anomaly_type: anomalyFilterType,
      limit: 100
    })
      .then(res => setAnomaliesData(res))
      .catch(err => setError(err.message));
  }, [anomalyFilterCity, anomalyFilterYear, anomalyFilterType]);

  // Fetch discovery
  useEffect(() => {
    fetchPatternDiscovery()
      .then(res => {
        setDiscoveryData(res);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading && !comparisonResult) {
    return <LoadingState message="Loading weather pattern analysis..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  // Helper for Anomalies Decadal Bar Chart
  const anomalyYears = anomaliesData?.by_year?.map(r => r.year) || [];
  const heatAnomalies = anomaliesData?.by_year?.map(r => r['Unusually High Temperature'] || 0) || [];
  const rainAnomalies = anomaliesData?.by_year?.map(r => r['Unusually High Rainfall'] || 0) || [];
  const windAnomalies = anomaliesData?.by_year?.map(r => r['Unusually Strong Wind'] || 0) || [];

  // Helper for Top Cities Anomalies
  const topCityNames = anomaliesData?.top_cities ? Object.keys(anomaliesData.top_cities) : [];
  const topCityCounts = anomaliesData?.top_cities ? Object.values(anomaliesData.top_cities) : [];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Weather Patterns</h1>
          <p className="page-desc">
            Visual comparative profiles, unusual weather patterns, and multi-dimensional climate discovery.
          </p>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="subtabs">
        <button
          className={`subtab-btn ${activeSubtab === 'profiles' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('profiles')}
        >
          City Profiles
        </button>
        <button
          className={`subtab-btn ${activeSubtab === 'anomalies' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('anomalies')}
        >
          Unusual Weather
        </button>
        <button
          className={`subtab-btn ${activeSubtab === 'discovery' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('discovery')}
        >
          Pattern Discovery
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. CITY WEATHER PROFILES                                  */}
      {/* ========================================================= */}
      {activeSubtab === 'profiles' && comparisonResult && (
        <div>
          {/* Comparison Selector Controls */}
          <div className="filter-bar">
            <span className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ArrowRightLeft size={16} color="var(--primary)" />
              Compare Cities:
            </span>

            <div className="filter-group">
              <span className="filter-label">City 1:</span>
              <select
                className="select-control"
                value={cityA}
                onChange={(e) => setCityA(e.target.value)}
              >
                {citiesList.map(c => (
                  <option key={c.city_name} value={c.city_name}>{c.city_name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <span className="filter-label">City 2:</span>
              <select
                className="select-control"
                value={cityB}
                onChange={(e) => setCityB(e.target.value)}
              >
                {citiesList.map(c => (
                  <option key={c.city_name} value={c.city_name}>{c.city_name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <span className="filter-label">City 3:</span>
              <select
                className="select-control"
                value={cityC}
                onChange={(e) => setCityC(e.target.value)}
              >
                <option value="">None</option>
                {citiesList.map(c => (
                  <option key={c.city_name} value={c.city_name}>{c.city_name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Visual Highlight Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginBottom: 20 }}>
            {comparisonResult.profiles.map((p, idx) => {
              const borderColors = ['#0F766E', '#F59E0B', '#3B82F6'];
              return (
                <div key={p.city_name} className="card" style={{ borderTop: `3px solid ${borderColors[idx % 3]}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{p.city_name}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rank #{p.rank}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Average Temp</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: borderColors[idx % 3] }}>{p.avg_temperature}°C</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Annual Rainfall</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.annual_rainfall} mm</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Seasonal Range</span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Δ {p.seasonal_temperature_variation}°C</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Daily Sunshine</span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{p.daily_sunshine_hours} hrs</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Visual Charts Grid 1 */}
          <div className="charts-grid-2">
            {/* Normalized Radar Chart */}
            {comparisonResult.radar?.series && (
              <ChartCard
                title="Climatic Profile Radar"
                subtitle="Relative index across 50 Indian cities (0–100 scale)"
                data={comparisonResult.radar.series.map((s, idx) => {
                  const colors = ['#0F766E', '#F59E0B', '#3B82F6'];
                  return {
                    type: 'scatterpolar',
                    r: [...s.normalized_values, s.normalized_values[0]],
                    theta: [...comparisonResult.radar.categories, comparisonResult.radar.categories[0]],
                    fill: 'toself',
                    name: s.city,
                    line: { color: colors[idx % colors.length], width: 2 },
                    fillcolor: `${colors[idx % colors.length]}18`,
                    hovertemplate: '<b>%{theta}</b>: %{r:.1f}<extra>' + s.city + '</extra>'
                  };
                })}
                layout={{
                  polar: {
                    radialaxis: { visible: true, range: [0, 100], gridcolor: '#F1F5F9' },
                    angularaxis: { gridcolor: '#E2E8F0' }
                  },
                  showlegend: true,
                  legend: { orientation: 'h', y: -0.15 }
                }}
              />
            )}

            {/* Indicator Grouped Bars */}
            <ChartCard
              title="Key Indicator Comparison"
              subtitle="Direct historical averages"
              data={[
                {
                  x: ['Avg Temp (°C)', 'Seasonality (°C)', 'Sunshine (h)', 'Wind (km/h)'],
                  y: [
                    comparisonResult.profiles[0]?.avg_temperature,
                    comparisonResult.profiles[0]?.seasonal_temperature_variation,
                    comparisonResult.profiles[0]?.daily_sunshine_hours,
                    comparisonResult.profiles[0]?.avg_wind_speed
                  ],
                  name: comparisonResult.profiles[0]?.city_name,
                  type: 'bar',
                  marker: { color: '#0F766E' }
                },
                {
                  x: ['Avg Temp (°C)', 'Seasonality (°C)', 'Sunshine (h)', 'Wind (km/h)'],
                  y: [
                    comparisonResult.profiles[1]?.avg_temperature,
                    comparisonResult.profiles[1]?.seasonal_temperature_variation,
                    comparisonResult.profiles[1]?.daily_sunshine_hours,
                    comparisonResult.profiles[1]?.avg_wind_speed
                  ],
                  name: comparisonResult.profiles[1]?.city_name,
                  type: 'bar',
                  marker: { color: '#F59E0B' }
                },
                ...(comparisonResult.profiles[2] ? [{
                  x: ['Avg Temp (°C)', 'Seasonality (°C)', 'Sunshine (h)', 'Wind (km/h)'],
                  y: [
                    comparisonResult.profiles[2]?.avg_temperature,
                    comparisonResult.profiles[2]?.seasonal_temperature_variation,
                    comparisonResult.profiles[2]?.daily_sunshine_hours,
                    comparisonResult.profiles[2]?.avg_wind_speed
                  ],
                  name: comparisonResult.profiles[2]?.city_name,
                  type: 'bar',
                  marker: { color: '#3B82F6' }
                }] : [])
              ]}
              layout={{
                barmode: 'group',
                yaxis: { title: 'Measurement Value', gridcolor: '#F1F5F9' },
                xaxis: { gridcolor: '#F1F5F9' },
                showlegend: true,
                legend: { orientation: 'h', y: -0.2 }
              }}
            />
          </div>

          {/* Visual Charts Grid 2: Thermal Extremes Buffer (Dumbbell / Range Chart) */}
          <div style={{ marginTop: 20 }}>
            <ChartCard
              title="Historical Thermal Operating Buffer"
              subtitle="Decadal range spanning lowest recorded minimum to highest recorded maximum temperature"
              height={300}
              data={comparisonResult.profiles.flatMap((p, idx) => {
                const colors = ['#0F766E', '#F59E0B', '#3B82F6'];
                return [
                  {
                    x: [p.coldest_temp_record, p.avg_temperature, p.hottest_temp_record],
                    y: [p.city_name, p.city_name, p.city_name],
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: p.city_name,
                    line: { color: colors[idx % 3], width: 4 },
                    marker: { size: [10, 14, 10], color: [colors[idx % 3], '#0F172A', colors[idx % 3]] },
                    hovertemplate: '%{x}°C<extra>' + p.city_name + '</extra>'
                  }
                ];
              })}
              layout={{
                xaxis: { title: 'Temperature (°C)', gridcolor: '#F1F5F9', zerolinecolor: '#CBD5E1' },
                yaxis: { gridcolor: '#F1F5F9' },
                showlegend: true,
                legend: { orientation: 'h', y: -0.25 }
              }}
            />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. UNUSUAL WEATHER (ANOMALIES) - HEAVILY VISUALIZED       */}
      {/* ========================================================= */}
      {activeSubtab === 'anomalies' && anomaliesData && (
        <div>
          {/* Filters */}
          <div className="filter-bar">
            <div className="filter-group">
              <span className="filter-label">City:</span>
              <select
                className="select-control"
                value={anomalyFilterCity}
                onChange={(e) => setAnomalyFilterCity(e.target.value)}
              >
                <option value="All">All 50 Cities</option>
                {citiesList.map(c => (
                  <option key={c.city_name} value={c.city_name}>{c.city_name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <span className="filter-label">Year:</span>
              <select
                className="select-control"
                value={anomalyFilterYear}
                onChange={(e) => setAnomalyFilterYear(Number(e.target.value))}
              >
                <option value={0}>All Years</option>
                {[2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <span className="filter-label">Category:</span>
              <select
                className="select-control"
                value={anomalyFilterType}
                onChange={(e) => setAnomalyFilterType(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Unusually High Temperature">High Temperature</option>
                <option value="Unusually High Rainfall">High Rainfall</option>
                <option value="Unusually Strong Wind">Strong Wind</option>
              </select>
            </div>

            <span className="badge badge-blue" style={{ marginLeft: 'auto' }}>
              {anomaliesData.total_anomalies} Occurrences Flagged
            </span>
          </div>

          {/* Core Visualizations for Anomalies */}
          <div className="charts-grid-2">
            {/* Chart 1: Decadal Stacked Bar Timeline */}
            <ChartCard
              title="Unusual Weather Over Time"
              subtitle="Annual occurrences broken down by atmospheric extreme type (2010–2019)"
              data={[
                {
                  x: anomalyYears,
                  y: heatAnomalies,
                  name: 'Extreme Heat',
                  type: 'bar',
                  marker: { color: '#F59E0B' },
                  hovertemplate: '%{x}: %{y} days<extra>Heat</extra>'
                },
                {
                  x: anomalyYears,
                  y: rainAnomalies,
                  name: 'Heavy Rainfall',
                  type: 'bar',
                  marker: { color: '#0F766E' },
                  hovertemplate: '%{x}: %{y} days<extra>Rain</extra>'
                },
                {
                  x: anomalyYears,
                  y: windAnomalies,
                  name: 'Strong Wind',
                  type: 'bar',
                  marker: { color: '#0284C7' },
                  hovertemplate: '%{x}: %{y} days<extra>Wind</extra>'
                }
              ]}
              layout={{
                barmode: 'stack',
                yaxis: { title: 'Number of Days', gridcolor: '#F1F5F9' },
                xaxis: { title: 'Year', gridcolor: '#F1F5F9' },
                showlegend: true,
                legend: { orientation: 'h', y: -0.2 }
              }}
            />

            {/* Chart 2: Top Cities by Extreme Weather Days */}
            <ChartCard
              title="Most Vulnerable Urban Centers"
              subtitle="Cities recording the highest volume of statistically unusual weather days"
              data={[
                {
                  y: [...topCityNames].reverse(),
                  x: [...topCityCounts].reverse(),
                  type: 'bar',
                  orientation: 'h',
                  marker: {
                    color: [...topCityCounts].reverse().map(v => v > 100 ? '#DC2626' : v > 80 ? '#F59E0B' : '#0F766E')
                  },
                  hovertemplate: '%{y}: %{x} extreme days<extra></extra>'
                }
              ]}
              layout={{
                margin: { l: 95, r: 25, t: 30, b: 45 },
                xaxis: { title: 'Extreme Weather Days', gridcolor: '#F1F5F9' },
                yaxis: { gridcolor: '#F1F5F9' }
              }}
            />
          </div>

          {/* Compact Data Table Underneath */}
          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-title">Recent Event Records Sample</div>
            <div className="table-container" style={{ maxHeight: 320, marginTop: 8 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>City</th>
                    <th>Category</th>
                    <th>Observed</th>
                    <th>Baseline</th>
                    <th>Deviation</th>
                  </tr>
                </thead>
                <tbody>
                  {anomaliesData.records.slice(0, 30).map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td>
                      <td><strong>{r.city_name}</strong></td>
                      <td>
                        <span className={`badge ${
                          r.anomaly_type.includes('Temperature') ? 'badge-amber' :
                          r.anomaly_type.includes('Rainfall') ? 'badge-blue' : 'badge-green'
                        }`}>
                          {r.anomaly_type.replace('Unusually ', '')}
                        </span>
                      </td>
                      <td><strong>{r.measured_value} {r.unit}</strong></td>
                      <td>{r.reference_mean} {r.unit}</td>
                      <td style={{ color: '#0F766E', fontWeight: 600 }}>+{r.difference} {r.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. PATTERN DISCOVERY (PCA & CLUSTERS)                      */}
      {/* ========================================================= */}
      {activeSubtab === 'discovery' && discoveryData && (
        <div>
          <div className="charts-grid-2">
            {/* 2D Projection Scatter - Clean Multi-Trace Cluster Visualization */}
            <ChartCard
              title="City Climate Clusters (PCA 2D Projection)"
              subtitle="Dimensionality reduction grouping 50 cities into 4 distinct climatic zones (83% variance)"
              height={450}
              data={(() => {
                const clusterConfigs = [
                  {
                    key: 'Warm & High Seasonality (Continental/Northern)',
                    label: 'Continental & Northern',
                    color: '#EF4444'
                  },
                  {
                    key: 'High Rainfall & Moderate Thermal Range (Coastal/Equatorial)',
                    label: 'Coastal & High Rainfall',
                    color: '#0284C7'
                  },
                  {
                    key: 'Hot & Semi-Arid (Western/Central)',
                    label: 'Hot & Semi-Arid',
                    color: '#F59E0B'
                  },
                  {
                    key: 'Equable / Mild Plateau (Peninsular)',
                    label: 'Peninsular Plateau',
                    color: '#0F766E'
                  }
                ];

                return clusterConfigs.map((cfg) => {
                  const filteredPoints = discoveryData.pca.projection.filter(
                    (p) => p.climate_cluster === cfg.key
                  );
                  return {
                    x: filteredPoints.map((p) => p.PC1),
                    y: filteredPoints.map((p) => p.PC2),
                    customdata: filteredPoints.map((p) => [
                      p.city_name,
                      p.rank,
                      cfg.label,
                      p.avg_temperature,
                      p.annual_rainfall
                    ]),
                    mode: 'markers',
                    name: `${cfg.label} (${filteredPoints.length})`,
                    type: 'scatter',
                    marker: {
                      size: 11,
                      color: cfg.color,
                      line: { color: '#FFFFFF', width: 1.5 },
                      opacity: 0.9
                    },
                    hovertemplate:
                      '<b>%{customdata[0]}</b> (Rank #%{customdata[1]})<br>' +
                      'Zone: %{customdata[2]}<br>' +
                      'Avg Temp: %{customdata[3]} °C<br>' +
                      'Annual Rain: %{customdata[4]} mm<extra></extra>'
                  };
                });
              })()}
              layout={{
                xaxis: {
                  title: 'PC1: Continentality & Thermal Amplitude (53.7% Var)',
                  gridcolor: '#F1F5F9',
                  zeroline: true,
                  zerolinecolor: '#94A3B8',
                  zerolinewidth: 1.2
                },
                yaxis: {
                  title: 'PC2: Monsoon Hydrology & Rainfall (29.3% Var)',
                  gridcolor: '#F1F5F9',
                  zeroline: true,
                  zerolinecolor: '#94A3B8',
                  zerolinewidth: 1.2
                },
                showlegend: true,
                legend: {
                  orientation: 'h',
                  y: -0.25,
                  x: 0.5,
                  xanchor: 'center',
                  font: { size: 10 }
                },
                annotations: [
                  {
                    x: -2.8,
                    y: 5.5,
                    xref: 'x',
                    yref: 'y',
                    text: 'High Rain / Maritime',
                    showarrow: false,
                    font: { size: 10, color: '#94A3B8' }
                  },
                  {
                    x: 6.5,
                    y: 3.5,
                    xref: 'x',
                    yref: 'y',
                    text: 'Extreme Seasonality',
                    showarrow: false,
                    font: { size: 10, color: '#94A3B8' }
                  },
                  {
                    x: 2.5,
                    y: -2.2,
                    xref: 'x',
                    yref: 'y',
                    text: 'Arid / Low Rain',
                    showarrow: false,
                    font: { size: 10, color: '#94A3B8' }
                  },
                  {
                    x: -2.8,
                    y: -2.2,
                    xref: 'x',
                    yref: 'y',
                    text: 'Equable Plateau',
                    showarrow: false,
                    font: { size: 10, color: '#94A3B8' }
                  }
                ]
              }}
            />

            {/* Correlation Matrix */}
            <ChartCard
              title="Weather Variable Correlations"
              subtitle="Pearson correlation heatmap across all meteorological indicators"
              height={420}
              data={[
                {
                  z: discoveryData.correlation.matrix,
                  x: discoveryData.correlation.variables,
                  y: discoveryData.correlation.variables,
                  type: 'heatmap',
                  colorscale: 'RdBu',
                  reversescale: true,
                  zmin: -1,
                  zmax: 1,
                  hovertemplate: '%{x} vs %{y}: r = %{z:.2f}<extra></extra>'
                }
              ]}
              layout={{
                margin: { l: 120, r: 25, t: 20, b: 90 },
                xaxis: { tickangle: -35 }
              }}
            />
          </div>

          {/* Feature Contribution Loadings Bar Chart */}
          {discoveryData.pca?.loadings && (
            <div style={{ marginTop: 20 }}>
              <ChartCard
                title="Climatic Driver Contributions (PCA Loadings)"
                subtitle="Visualizing mathematical feature weights driving the two principal axes"
                height={320}
                data={[
                  {
                    x: discoveryData.pca.loadings.map(l => l.feature.replace(/_/g, ' ').toUpperCase()),
                    y: discoveryData.pca.loadings.map(l => l.PC1_Loading),
                    name: 'PC1: Thermal Seasonality',
                    type: 'bar',
                    marker: { color: '#0F766E' }
                  },
                  {
                    x: discoveryData.pca.loadings.map(l => l.feature.replace(/_/g, ' ').toUpperCase()),
                    y: discoveryData.pca.loadings.map(l => l.PC2_Loading),
                    name: 'PC2: Monsoon Hydrology',
                    type: 'bar',
                    marker: { color: '#0284C7' }
                  }
                ]}
                layout={{
                  barmode: 'group',
                  yaxis: { title: 'Feature Weight (Eigenvector Loading)', gridcolor: '#F1F5F9' },
                  xaxis: { gridcolor: '#F1F5F9' },
                  showlegend: true,
                  legend: { orientation: 'h', y: -0.25 }
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
