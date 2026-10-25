# AtmosIQ — Tableau Dashboards Creation & Publishing Manual

This document details the configuration, worksheets, measures, and calculated fields for the two integrated Tableau dashboards in AtmosIQ:
1. **Dashboard 1: India Weather Overview & Climate Trends**
2. **Dashboard 2: Urban Risk & Disaster Management**

---

## 1. Connecting to the Dataset
1. Launch Tableau Desktop or Tableau Public.
2. Under **Connect > To a File**, click **Text File**.
3. Select `data/processed/weather_cleaned.csv`.
4. Verify schema detection:
   - Total rows: 182,600
   - `datetime` is identified as Date.
   - `city_name` has Geographic Role set to **City**.
   - Verified numerical measures: `temperature_2m_mean`, `temperature_2m_max`, `temperature_2m_min`, `precipitation_sum`, `wind_speed_10m_max`, `precipitation_hours`, etc.

---

## 2. DASHBOARD 1: India Weather Overview & Climate Trends

**Public URL**: `https://public.tableau.com/views/dashboard_1_DAV_assign_/Dashboard1`

### Executive Summary
* **Total Observations**: 182,600 daily records across 50 Indian cities (2010–2019).
* **Cumulative Precipitation**: 560,915 mm across all urban centers.
* **Average Maximum Temperature**: 31.0°C national baseline.

### Worksheets Configured:
1. **Total Observations / KPI**: Top metric banner tracking observation count (182,600), cumulative precipitation sum (560,915 mm), and average maximum temperature (31°C).
2. **Geographic Weather Map**: National spatial map plotting all 50 cities. Bubble color reflects Average Temperature (°C) and bubble size scales with Total Precipitation Sum.
3. **Temperature Trends**: Multi-year monthly timeline (2010–2020) contrasting Average Apparent Temperature against 2-Meter Air Temperature to visualize thermal seasonality.
4. **Extreme Event Heatmap**: City-by-month temporal matrix tracking extreme temperature and rainfall frequency across the decadal window.
5. **Precipitation & Snowfall Analysis**: Dual-axis monthly time series showing seasonal monsoon peaks in precipitation sum alongside precipitation duration hours.

### Calculated Fields:
* **Extreme Event Flag**: `IF [precipitation_sum] >= 50.0 OR [temperature_2m_max] >= 40.0 THEN 1 ELSE 0 END`
* **Observation Count**: `COUNT([daily_data_combined_2010_to_2019.csv])`

---

## 3. DASHBOARD 2: Urban Risk & Disaster Management

**Public URL**: `https://public.tableau.com/views/dashboard_2_DAV_assign_/UrbanRiskDisasterManagement`

### Executive Summary
* **Average Maximum Wind**: 14.0 km/h baseline.
* **Extreme Events Flagged**: 2,599 high-risk days across the 50 cities.
* **Total Rain Volume**: 11,218 mm average municipal volume.

### Worksheets Configured:
1. **Urban KPI Summary**: Top indicator row tracking Average Maximum Wind (14 km/h), Total Extreme Events (2,599), Observation Volume (182,600), and Total Rainfall.
2. **City Vulnerability Scorecard**: Ranked horizontal bar chart highlighting high-risk cities (led by Guwahati, Srinagar, Kolkata, Haora, Rānchī) by extreme event count.
3. **Climate Extremes Scatter Plot**: Multivariate scatter plot analyzing Average Annual Rainfall vs Average Maximum Wind Speed to reveal coastal and flood-prone clusters.
4. **Heavy Rain & Wind Risk Matrix**: Tabular risk index evaluating Annual Rain (mm), Max Wind (km/h), Extreme Events count, and Heavy Rain Days across all 50 cities.
5. **Temperature Extremes Range**: Floating bar chart showing the thermal buffer between Average Lowest and Average Highest recorded temperatures per city.

### Calculated Fields:
* **Heavy Rain Days**: `SUM(IF [precipitation_sum] >= 50.0 THEN 1 ELSE 0 END)`
* **Extreme Events Count**: `SUM(IF [precipitation_sum] >= 50.0 OR [temperature_2m_max] >= 40.0 THEN 1 ELSE 0 END)`
* **Thermal Span Range**: `[Avg. Highest Temp] - [Avg. Lowest Temp]`

---

## 4. Embedding Integration

Both dashboards are integrated into AtmosIQ via the **Tableau Embedding API v3** (`<iframe src="...?:embed=yes&:showVizHome=no&:toolbar=yes&:showShareOptions=true">`). Users can seamlessly toggle between the two dashboards with loading overlays and direct fallback links to Tableau Public.
