import React, { useState, useEffect } from 'react';
import {
  fetchCities,
  fetchOverview,
  fetchTemperatureTrends,
  fetchRainfallPatterns,
  fetchWeatherAcrossCities,
  fetchTemperatureHeatmap,
  fetchWeatherMap,
  fetchWeatherDistribution
} from '../services/api';
import MetricCard from '../components/MetricCard';
import ChartCard from '../components/ChartCard';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { Sparkles, Calendar, MapPin, SlidersHorizontal } from 'lucide-react';

export default function Overview() {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [startYear, setStartYear] = useState(2010);
  const [endYear, setEndYear] = useState(2019);
  const [aggregation, setAggregation] = useState('monthly');
  const [rainfallMode, setRainfallMode] = useState('average');
  const [comparisonVar, setComparisonVar] = useState('temperature_2m_mean');

  // Data states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overviewData, setOverviewData] = useState(null);
  const [tempTrends, setTempTrends] = useState(null);
  const [rainfallData, setRainfallData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [distData, setDistData] = useState(null);

  // Load cities list once
  useEffect(() => {
    fetchCities()
      .then(data => setCities(data))
      .catch(err => console.error('Failed to load cities', err));
  }, []);

  // Load overview metrics and charts whenever primary filters change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetchOverview({ cities: selectedCity, start_year: startYear, end_year: endYear }),
      fetchTemperatureTrends({ city: selectedCity, start_year: startYear, end_year: endYear, aggregation }),
      fetchRainfallPatterns({ city: selectedCity, start_year: startYear, end_year: endYear, mode: rainfallMode }),
      fetchWeatherAcrossCities({ variable: comparisonVar, start_year: startYear, end_year: endYear, limit: 15 }),
      fetchTemperatureHeatmap({ city: selectedCity, start_year: startYear, end_year: endYear }),
      fetchWeatherMap({ variable: comparisonVar, start_year: startYear, end_year: endYear }),
      fetchWeatherDistribution({ city: selectedCity, variable: comparisonVar, start_year: startYear, end_year: endYear })
    ])
      .then(([ov, trends, rain, comp, heat, mData, dist]) => {
        if (!isMounted) return;
        setOverviewData(ov);
        setTempTrends(trends);
        setRainfallData(rain);
        setComparisonData(comp);
        setHeatmapData(heat);
        setMapData(mData);
        setDistData(dist);
        setLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        setError(err.message);
        setLoading(false);
      });

    return () => { isMounted = false; };
  }, [selectedCity, startYear, endYear, aggregation, rainfallMode, comparisonVar]);

  if (loading && !overviewData) {
    return <LoadingState message="Loading weather data..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  const metrics = overviewData?.metrics || {};
  const insights = overviewData?.insights || [];

  return (
    <div>
      {/* Page Title */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Weather Overview</h1>
          <p className="page-desc">
            Historical weather observations and trends across 50 major Indian cities (2010–2019).
          </p>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="metric-grid">
        <MetricCard
          label={metrics.cities_count?.label || 'Cities Covered'}
          value={metrics.cities_count?.value || 50}
          subtext="Major urban centers"
        />
        <MetricCard
          label={metrics.days_count?.label || 'Days of Weather Data'}
          value={(metrics.days_count?.value || 3652).toLocaleString()}
          subtext="Daily records per city"
        />
        <MetricCard
          label={metrics.avg_temperature?.label || 'Average Temperature'}
          value={metrics.avg_temperature?.value ?? '--'}
          unit={metrics.avg_temperature?.unit || '°C'}
          subtext="Daily mean"
        />
        <MetricCard
          label={metrics.total_rainfall?.label || 'Total Rainfall'}
          value={metrics.total_rainfall?.value ?? '--'}
          unit={metrics.total_rainfall?.unit || 'mm'}
          subtext="Annual average per city"
        />
        <MetricCard
          label={metrics.warmest_record?.label || 'Warmest Recorded Day'}
          value={metrics.warmest_record?.value ?? '--'}
          unit={metrics.warmest_record?.unit || '°C'}
          subtext={metrics.warmest_record?.subtext || ''}
        />
        <MetricCard
          label={metrics.coldest_record?.label || 'Coldest Recorded Day'}
          value={metrics.coldest_record?.value ?? '--'}
          unit={metrics.coldest_record?.unit || '°C'}
          subtext={metrics.coldest_record?.subtext || ''}
        />
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <MapPin size={15} color="var(--primary)" />
          <span className="filter-label">City:</span>
          <select
            className="select-control"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            {cities.map((c) => (
              <option key={c.city_name} value={c.city_name}>
                {c.city_name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <Calendar size={15} color="var(--primary)" />
          <span className="filter-label">Year Range:</span>
          <select
            className="select-control"
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
          >
            {[2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019].map((y) => (
              <option key={y} value={y} disabled={y > endYear}>
                {y}
              </option>
            ))}
          </select>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>–</span>
          <select
            className="select-control"
            value={endYear}
            onChange={(e) => setEndYear(Number(e.target.value))}
          >
            {[2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019].map((y) => (
              <option key={y} value={y} disabled={y < startYear}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <SlidersHorizontal size={15} color="var(--primary)" />
          <span className="filter-label">Variable:</span>
          <select
            className="select-control"
            value={comparisonVar}
            onChange={(e) => setComparisonVar(e.target.value)}
          >
            <option value="temperature_2m_mean">Average Temperature (°C)</option>
            <option value="temperature_2m_max">Maximum Temperature (°C)</option>
            <option value="precipitation_sum">Annual Rainfall (mm)</option>
            <option value="wind_speed_10m_max">Strongest Wind (km/h)</option>
            <option value="sunshine_hours">Sunshine Duration (hours)</option>
            <option value="apparent_temperature_mean">Feels-Like Temperature (°C)</option>
          </select>
        </div>
      </div>

      {/* Weather Highlights Visual Cards */}
      {insights.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginBottom: 20 }}>
          {insights.map((ins, idx) => (
            <div key={idx} className="card" style={{ padding: '12px 16px', background: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{ins.category}</span>
                <Sparkles size={13} color="var(--primary)" />
              </div>
              <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                {ins.title}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                {ins.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Charts Grid 1 */}
      <div className="charts-grid-2">
        {/* Chart 1: Temperature Trends */}
        {tempTrends && (
          <ChartCard
            title="Temperature Trends"
            subtitle={`Historical daily mean, max, and min temperatures for ${selectedCity}`}
            controls={
              <div style={{ display: 'flex', gap: 6 }}>
                {['daily', 'monthly', 'yearly'].map((mode) => (
                  <button
                    key={mode}
                    className={`btn ${aggregation === mode ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                    onClick={() => setAggregation(mode)}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            }
            data={[
              {
                x: tempTrends.dates,
                y: tempTrends.max,
                name: 'Maximum',
                type: 'scatter',
                mode: 'lines',
                line: { color: '#F59E0B', width: 1.2 },
                hoverinfo: 'x+y'
              },
              {
                x: tempTrends.dates,
                y: tempTrends.mean,
                name: 'Average',
                type: 'scatter',
                mode: 'lines',
                line: { color: '#0F766E', width: 2 },
                fill: 'tonexty',
                fillcolor: 'rgba(15, 118, 110, 0.08)',
                hoverinfo: 'x+y'
              },
              {
                x: tempTrends.dates,
                y: tempTrends.min,
                name: 'Minimum',
                type: 'scatter',
                mode: 'lines',
                line: { color: '#0284C7', width: 1.2 },
                fill: 'tonexty',
                fillcolor: 'rgba(2, 132, 199, 0.06)',
                hoverinfo: 'x+y'
              }
            ]}
            layout={{
              yaxis: { title: 'Temperature (°C)', gridcolor: '#F1F5F9' },
              xaxis: { gridcolor: '#F1F5F9' },
              showlegend: true,
              legend: { orientation: 'h', y: -0.2 }
            }}
          />
        )}

        {/* Chart 2: Rainfall Throughout the Year */}
        {rainfallData && (
          <ChartCard
            title="Rainfall Throughout the Year"
            subtitle={`Monthly precipitation distribution for ${selectedCity}`}
            controls={
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className={`btn ${rainfallMode === 'average' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                  onClick={() => setRainfallMode('average')}
                >
                  Monthly Average
                </button>
                <button
                  className={`btn ${rainfallMode === 'total' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                  onClick={() => setRainfallMode('total')}
                >
                  Total Cumulative
                </button>
              </div>
            }
            data={[
              {
                x: rainfallData.months,
                y: rainfallData.rainfall,
                type: 'bar',
                marker: {
                  color: rainfallData.rainfall.map((v) =>
                    v > 150 ? '#0F766E' : v > 50 ? '#14B8A6' : '#99F6E4'
                  ),
                  line: { color: '#0F766E', width: 1 }
                },
                hovertemplate: '%{x}: %{y:.1f} mm<extra></extra>'
              }
            ]}
            layout={{
              yaxis: { title: 'Rainfall (mm)', gridcolor: '#F1F5F9' },
              xaxis: { gridcolor: '#F1F5F9' }
            }}
          />
        )}
      </div>

      {/* Main Charts Grid 2 */}
      <div className="charts-grid-2">
        {/* Chart 3: Weather Across Cities */}
        {comparisonData && (
          <ChartCard
            title="Weather Across Indian Cities"
            subtitle={`Cities ranked by ${comparisonData.label}`}
            data={[
              {
                y: [...comparisonData.cities].reverse(),
                x: [...comparisonData.values].reverse(),
                type: 'bar',
                orientation: 'h',
                marker: {
                  color: '#0F766E'
                },
                hovertemplate: '%{y}: %{x:.2f} ' + comparisonData.unit + '<extra></extra>'
              }
            ]}
            layout={{
              margin: { l: 90, r: 25, t: 30, b: 45 },
              xaxis: { title: `${comparisonData.label} (${comparisonData.unit})`, gridcolor: '#F1F5F9' },
              yaxis: { gridcolor: '#F1F5F9' }
            }}
          />
        )}

        {/* Chart 4: Monthly Temperature Heatmap */}
        {heatmapData && (
          <ChartCard
            title="Monthly Temperature Calendar"
            subtitle={`Average monthly temperatures across years for ${selectedCity}`}
            data={[
              {
                z: heatmapData.z,
                x: heatmapData.months,
                y: heatmapData.years,
                type: 'heatmap',
                colorscale: [
                  [0.0, '#3B82F6'],
                  [0.3, '#6EE7B7'],
                  [0.6, '#FDE047'],
                  [0.85, '#FB923C'],
                  [1.0, '#DC2626']
                ],
                hoverongaps: false,
                hovertemplate: 'Year %{y}, %{x}: %{z:.1f}°C<extra></extra>'
              }
            ]}
            layout={{
              yaxis: { title: 'Year', autorange: 'reversed' },
              xaxis: { title: 'Month' }
            }}
          />
        )}
      </div>

      {/* Main Charts Grid 3 */}
      <div className="charts-grid-2">
        {/* Chart 5: Weather Map */}
        {mapData && (
          <ChartCard
            title="Geographic Weather Distribution"
            subtitle={`City-level ${mapData.label} across India`}
            height={400}
            data={[
              {
                type: 'scattergeo',
                lon: mapData.cities.map((c) => c.lon),
                lat: mapData.cities.map((c) => c.lat),
                text: mapData.cities.map(
                  (c) => `<b>${c.city_name}</b><br>${mapData.label}: ${c.value} ${mapData.unit}`
                ),
                hoverinfo: 'text',
                marker: {
                  size: mapData.cities.map((c) => Math.max(9, Math.min(22, c.population / 1500000))),
                  color: mapData.cities.map((c) => c.value),
                  colorscale: 'Tealgrn',
                  colorbar: {
                    title: mapData.unit,
                    thickness: 12,
                    len: 0.8
                  },
                  line: { color: '#0F172A', width: 0.8 }
                }
              }
            ]}
            layout={{
              geo: {
                scope: 'asia',
                center: { lat: 21.5, lon: 81.0 },
                projection: { type: 'mercator', scale: 4.6 },
                showland: true,
                landcolor: '#F8FAFC',
                countrycolor: '#CBD5E1',
                showocean: true,
                oceancolor: '#F0F9FF',
                showlakes: true,
                lakecolor: '#E0F2FE'
              },
              margin: { l: 0, r: 0, t: 10, b: 10 }
            }}
          />
        )}

        {/* Chart 6: Weather Distribution */}
        {distData && (
          <ChartCard
            title="Statistical Distribution"
            subtitle={`Histogram of ${distData.label} for ${selectedCity}`}
            height={400}
            data={[
              {
                x: distData.histogram.bin_centers,
                y: distData.histogram.counts,
                type: 'bar',
                marker: { color: '#14B8A6', opacity: 0.85 },
                hovertemplate: '%{x} ' + distData.unit + ': %{y} days<extra></extra>'
              }
            ]}
            layout={{
              xaxis: { title: `${distData.label} (${distData.unit})`, gridcolor: '#F1F5F9' },
              yaxis: { title: 'Number of Days', gridcolor: '#F1F5F9' },
              annotations: [
                {
                  x: distData.stats.mean,
                  y: Math.max(...distData.histogram.counts) * 0.9,
                  text: `Mean: ${distData.stats.mean} ${distData.unit}<br>Median: ${distData.stats.median} ${distData.unit}`,
                  showarrow: true,
                  arrowhead: 2,
                  ax: 35,
                  ay: -25,
                  font: { size: 10, color: '#0F172A' },
                  bgcolor: '#FFFFFF',
                  bordercolor: '#CBD5E1',
                  borderwidth: 1
                }
              ]
            }}
          />
        )}
      </div>
    </div>
  );
}
