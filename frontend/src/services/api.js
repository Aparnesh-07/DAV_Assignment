/**
 * AtmosIQ - API Service Client
 * Connects React frontend to FastAPI backend.
 */

const API_BASE = '/api';

export async function fetchVariables() {
  const res = await fetch(`${API_BASE}/variables`);
  if (!res.ok) throw new Error('Failed to load variable mappings');
  return res.json();
}

export async function fetchCities() {
  const res = await fetch(`${API_BASE}/cities`);
  if (!res.ok) throw new Error('Failed to load cities');
  return res.json();
}

export async function fetchOverview(params = {}) {
  const query = new URLSearchParams();
  if (params.cities && params.cities !== 'All') query.set('cities', params.cities);
  if (params.start_year) query.set('start_year', params.start_year);
  if (params.end_year) query.set('end_year', params.end_year);
  if (params.months && params.months.length > 0) query.set('months', params.months.join(','));

  const res = await fetch(`${API_BASE}/overview?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load overview data');
  return res.json();
}

export async function fetchTemperatureTrends(params = {}) {
  const query = new URLSearchParams({
    city: params.city || 'Delhi',
    start_year: params.start_year || 2010,
    end_year: params.end_year || 2019,
    aggregation: params.aggregation || 'monthly'
  });
  const res = await fetch(`${API_BASE}/weather/trends?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load temperature trends');
  return res.json();
}

export async function fetchRainfallPatterns(params = {}) {
  const query = new URLSearchParams({
    city: params.city || 'Delhi',
    start_year: params.start_year || 2010,
    end_year: params.end_year || 2019,
    mode: params.mode || 'average'
  });
  const res = await fetch(`${API_BASE}/weather/rainfall?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load rainfall patterns');
  return res.json();
}

export async function fetchWeatherAcrossCities(params = {}) {
  const query = new URLSearchParams({
    variable: params.variable || 'temperature_2m_mean',
    start_year: params.start_year || 2010,
    end_year: params.end_year || 2019,
    sort_order: params.sort_order || 'desc',
    limit: params.limit || 20
  });
  const res = await fetch(`${API_BASE}/weather/comparison?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load city comparison');
  return res.json();
}

export async function fetchTemperatureHeatmap(params = {}) {
  const query = new URLSearchParams({
    city: params.city || 'Delhi',
    start_year: params.start_year || 2010,
    end_year: params.end_year || 2019
  });
  const res = await fetch(`${API_BASE}/weather/heatmap?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load temperature heatmap');
  return res.json();
}

export async function fetchWeatherMap(params = {}) {
  const query = new URLSearchParams({
    variable: params.variable || 'temperature_2m_mean',
    start_year: params.start_year || 2010,
    end_year: params.end_year || 2019
  });
  const res = await fetch(`${API_BASE}/weather/map?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load map data');
  return res.json();
}

export async function fetchWeatherDistribution(params = {}) {
  const query = new URLSearchParams({
    city: params.city || 'Delhi',
    variable: params.variable || 'temperature_2m_mean',
    start_year: params.start_year || 2010,
    end_year: params.end_year || 2019
  });
  const res = await fetch(`${API_BASE}/weather/distribution?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load distribution');
  return res.json();
}

// KNIME Patterns Endpoints
export async function fetchPatternsStatus() {
  const res = await fetch(`${API_BASE}/patterns/status`);
  if (!res.ok) throw new Error('Failed to load KNIME status');
  return res.json();
}

export async function fetchCityProfiles(cityA, cityB, cityC) {
  const query = new URLSearchParams();
  if (cityA && cityB) {
    query.set('city_a', cityA);
    query.set('city_b', cityB);
    if (cityC) query.set('city_c', cityC);
  }
  const res = await fetch(`${API_BASE}/patterns/city-profiles?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load city profiles');
  return res.json();
}

export async function fetchAnomalies(params = {}) {
  const query = new URLSearchParams();
  if (params.city) query.set('city', params.city);
  if (params.year) query.set('year', params.year);
  if (params.anomaly_type) query.set('anomaly_type', params.anomaly_type);
  if (params.limit) query.set('limit', params.limit);

  const res = await fetch(`${API_BASE}/patterns/anomalies?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load anomalies');
  return res.json();
}

export async function fetchPatternDiscovery() {
  const res = await fetch(`${API_BASE}/patterns/discovery`);
  if (!res.ok) throw new Error('Failed to load pattern discovery');
  return res.json();
}

export async function fetchQualityReport() {
  const res = await fetch(`${API_BASE}/patterns/data-quality`);
  if (!res.ok) throw new Error('Failed to load data quality report');
  return res.json();
}

// Prediction Endpoints
export async function fetchPredictionMetadata() {
  const res = await fetch(`${API_BASE}/prediction/metadata`);
  if (!res.ok) throw new Error('Failed to load prediction metadata');
  return res.json();
}

export async function postPrediction(payload) {
  const res = await fetch(`${API_BASE}/prediction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to compute prediction');
  }
  return res.json();
}
