# AtmosIQ — Indian Weather Intelligence Platform
## Course Project Report: Data Analysis and Visualization (DAV)

---

### Executive Abstract
Weather patterns across the Indian subcontinent exhibit immense geospatial heterogeneity, ranging from alpine Himalayan regimes in Srinagar to arid thermal extremities in western plains and tropical maritime regimes along the Konkan and Coromandel coastlines. This project presents **AtmosIQ**, a dedicated Indian Weather Intelligence Platform designed to explore, analyze, and visualize daily historical meteorological observations across India’s 50 most populous urban centers from 2010 to 2019 (182,600 daily records). AtmosIQ demonstrates a cohesive, non-overlapping tri-technology architecture combining **Python (FastAPI & Scikit-learn)** for high-throughput data pipelines and leak-free machine learning, **KNIME Analytics Platform** for formal visual workflow mining and anomaly isolation, and **Tableau** for interactive visual storytelling and geospatial drill-downs.

---

### 1. Introduction
Understanding historical weather variability across Indian cities is critical for urban resilience, agricultural planning, heatwave mitigation, and energy grid load balancing. Traditional environmental dashboards often overwhelm users with dense telemetry, confusing technical nomenclature (e.g., `temperature_2m_mean`), or disconnected visual charts. AtmosIQ addresses these shortcomings by delivering a clean, four-section architecture utilizing common-language terminology, verified historical datasets, and rigorous statistical analysis.

---

### 2. Problem Statement
Analyzing a decadal time series comprising 182,600 daily records across 50 diverse cities requires handling multi-dimensional meteorological indicators, ensuring temporal completeness, detecting statistically unusual phenomena without subjective labeling, and presenting findings in an accessible yet academically defensible interface. Furthermore, integrating multiple analytics tools (Python, KNIME, Tableau) into a single operational application without fabricating synthetic results remains a key technical challenge.

---

### 3. Project Objectives
1. **Data Ingestion & Integrity**: Process 10 years of verified daily data (2010–2019) across 50 Indian cities without loss of temporal continuity.
2. **Centralized Semantic Mapping**: Eliminate raw technical column names in favor of intuitive, unit-accurate terminology.
3. **Multi-Tool Synergy**:
   - Python: Powers dynamic filtering, descriptive statistics, Plotly visual rendering, and ML estimation.
   - KNIME: Performs visual data quality audits, multi-year aggregations, 99th-percentile anomaly isolation, and PCA dimensionality reduction.
   - Tableau: Embeds interactive, published visual dashboards for geospatial and multivariate analysis.
4. **Leak-Free Predictive Analytics**: Train and evaluate a time-series temperature forecast model using strict chronological holdout data.

---

### 4. Dataset Description
The analysis utilizes three primary data files:
- `cities.csv`: 50 rows containing urban rankings, city names, geographic coordinates (`latitude`, `longitude`), and census population figures.
- `daily_data_combined_2010_to_2019.csv`: 182,600 rows & 22 columns covering daily observations from 2010-01-01 to 2019-12-31.
- `daily_units_2010_to_2019.csv`: Unit metadata defining standard meteorological measurement units.

#### Data Integrity Audit:
- **Unique Cities**: Exactly 50 cities.
- **Temporal Span**: 3,652 consecutive calendar days per city (including leap years 2012 and 2016).
- **Completeness**: 100% complete daily time series across all 50 cities.
- **Duplicate Records**: 0 duplicates across `(city_name, datetime)`.
- **Missing Values**: Exactly 1 missing value in raw `et0_fao_evapotranspiration` (Guwahati, 2016-06-05).

---

### 5. Data Preprocessing & Cleaning Rationale
1. **Datetime Parsing**: Formatted as ISO-8601 timestamps; extracted `year`, `month`, `day`, `dayofyear`, and `season` based on India Meteorological Department (IMD) standards.
2. **Duration Conversions**: Converted `daylight_duration` and `sunshine_duration` from raw seconds into hours (`/ 3600.0`).
3. **Missing Value Imputation**: The solitary null cell was imputed using Guwahati's 10-year June climatological mean (4.44 mm).
4. **Outlier Policy**: Extreme meteorological occurrences (e.g., 47.3°C peak summer heat, 494.9 mm 24-hour rainfall) were retained as genuine physical phenomena.
5. **Storage**: Cleaned data saved to `data/processed/weather_cleaned.csv`.

---

### 6. Statistical Analysis Methodology
- **Descriptive Statistics**: Five-number summaries (minimum, Q1, median, Q3, maximum, mean, and standard deviation) computed for temperature, rainfall, wind speed, and radiation.
- **Continentality & Seasonality Range**: Defined as the thermal amplitude between the warmest and coolest calendar month averages ($\Delta T = \bar{T}_{\text{max\_month}} - \bar{T}_{\text{min\_month}}$).
- **Statistical Anomaly Isolation**: Applied a 99th-percentile threshold ($P_{99}$) on daily maximum temperature, rainfall ($\ge 50$ mm/day), and wind speed ($\ge 35$ km/h).
- **Dimensionality Reduction**: Principal Component Analysis (PCA) standardizes 8 city-level indicators and projects 50 cities onto 2 orthogonal axes.

---

### 7. Visualization Methodology
Visualizations adhere to minimalist principles:
- **Temperature Over Time**: Dual-band line chart showing maximum, mean, and minimum with shaded thermal envelopes.
- **Rainfall Distribution**: Monthly bar charts showing typical vs cumulative volumes with conditional teal-gradient styling.
- **Comparative Horizontal Bars**: Clean ranking across cities on any selected indicator.
- **Year-Month Heatmaps**: Matrix displays highlighting seasonal heat shifts across the decade.
- **Geographic Bubble Maps**: Scatter plots over Indian coordinates displaying population size and weather indicators.
- **Radar Profiles**: Normalized 0–100 min-max scaled polygons contrasting city profiles.

---

### 8. System Architecture
AtmosIQ features a decoupled full-stack architecture:
- **Frontend**: React.js 18 + Vite with clean CSS, responsive layouts, Lucide icons, and Plotly.js charts.
- **Backend API**: Python FastAPI exposing REST endpoints with cached in-memory data frames.
- **KNIME Engine**: File-based pipeline exporting CSV artifacts to `data/knime_outputs/`.
- **Tableau Engine**: Embeds published views via Tableau Embedding API v3 with custom URL support.

---

### 9. Python Implementation
The backend modular structure includes:
- `backend/app.py`: FastAPI application defining query parameters, CORS, and Pydantic validation.
- `backend/data_loader.py`: In-memory DataFrame caching and central semantic mapping.
- `backend/data_cleaning.py`: Automated cleaning and feature engineering pipeline.
- `backend/descriptive_statistics.py`: Dynamic slice filtering and real-time automated insight generation.
- `backend/weather_analysis.py`: Chart payload generator for Plotly visualizations.
- `backend/city_comparison.py`: Dynamic natural-language comparative observations.
- `backend/prediction.py`: Time-series ML model training and inference.

---

### 10. KNIME Integration
Three workflows run in KNIME Analytics Platform:
- **Workflow A**: Validates columns, parses dates, imputes missing values, and writes `data_quality_report.csv`.
- **Workflow B**: Groups data by city/year and city/month, applies quantile rules, and writes `weather_anomalies.csv`.
- **Workflow C**: Normalizes city indicators, performs PCA, and writes `city_weather_profiles.csv`, `pca_projection.csv`, and `pca_loadings.csv`.
The website monitors file timestamps and verifies workflow execution freshness.

---

### 11. Tableau Integration
Two dedicated, custom-authored dashboards were built in Tableau and integrated into AtmosIQ:
- **Dashboard 1 (India Weather Overview & Climate Trends)**:
  - *KPIs*: 182,600 observations, 560,915 mm cumulative precipitation, 31.0°C average maximum temperature.
  - *Worksheets*: Geographic Weather Map (bubble size by rainfall, color by temperature), Temperature Trends (apparent vs air temperature), Extreme Event Heatmap, and Precipitation & Snowfall Analysis.
- **Dashboard 2 (Urban Risk & Disaster Management)**:
  - *KPIs*: 14.0 km/h average maximum wind, 2,599 extreme events flagged, 11,218 mm municipal volume.
  - *Worksheets*: City Vulnerability Scorecard (ranked vulnerability index led by Guwahati, Srinagar, Kolkata), Climate Extremes Scatter Plot (annual rain vs max wind), Heavy Rain & Wind Risk Matrix, and Temperature Extremes Range (lowest vs highest thermal spans).
Both views are embedded directly in the application with loading overlays, live interactive tooltips, and complete authoring documentation.

---

### 12. Weather Prediction Methodology
- **Target**: Next-day mean 2-meter air temperature ($T_{t+1}$).
- **Features**: Current day mean temp, diurnal range ($T_{\text{max}} - T_{\text{min}}$), rainfall, wind speed, solar radiation, cyclical day-of-year ($\sin, \cos$), cyclical month, and coordinates.
- **Split**: Chronological holdout (Train: 2010–2017, Test: 2018–2019). No lookahead leakage.
- **Model Evaluation**:
  - **Hist-Gradient Boosting**: MAE = **0.697°C**, RMSE = **0.948°C**, $R^2$ = **0.975**.
  - **Ridge Regression**: MAE = 0.718°C, RMSE = 0.978°C, $R^2$ = 0.973.
  - **Persistence Baseline**: MAE = 0.727°C, RMSE = 0.995°C, $R^2$ = 0.972.

---

### 13. Results & Discussion
1. **Thermal Disparity**: Delhi records an extreme seasonal temperature amplitude of 20.15°C, whereas maritime Mumbai exhibits only 5.85°C.
2. **Hydrological Concentration**: Over 78% of peninsular rainfall occurs within the 4-month June–September monsoon window.
3. **PCA Insights**: PC1 (53.7% variance) isolates Continentality & Seasonality; PC2 (29.3% variance) isolates Monsoon Precipitation vs Aridity, grouping the 50 cities into 4 distinct climatic zones.
4. **Predictive Performance**: Incorporating non-linear diurnal ranges and cyclical solar angles improves forecast accuracy over simple persistence by 4.1% in MAE.

---

### 14. Academic Limitations
1. **Correlation vs Causation**: Statistical associations do not imply physical causation without radiative transfer and hydrodynamic modeling.
2. **Decadal Span**: 10 years reflects climatological baseline conditions rather than long-term secular climate change (which requires $\ge 30$ years).
3. **Localized Phenomena**: Statistical aggregations cannot resolve urban microclimates or rapid convective squalls.

---

### 15. Future Scope
- Integration with live Open-Meteo or IMD radar feeds for real-time nowcasting.
- Spatial kriging interpolation across intermediate rural districts.
- Expansion to include air quality index (AQI) and aerosol optical depth (AOD) parameters.

---

### 16. Conclusion
AtmosIQ fulfills all pedagogical and technical requirements for an innovative Data Analysis and Visualization course project. By unifying Python, KNIME, and Tableau into a harmonious, minimal, and fully documented platform, AtmosIQ delivers meaningful weather intelligence across Indian cities while maintaining rigorous academic integrity.
