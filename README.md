# AtmosIQ — Indian Weather Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.10-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)](https://vitejs.dev/)
[![KNIME](https://img.shields.io/badge/KNIME-Analytics_Platform-F1A100.svg)](https://www.knime.com/)
[![Tableau](https://img.shields.io/badge/Tableau-Embedding_API_v3-E97627.svg)](https://public.tableau.com/)

AtmosIQ is a comprehensive, functional, and minimal web platform for exploring and understanding historical daily weather patterns across the **50 most populous cities in India** from **2010 to 2019** (182,600 daily records).

Built as an Innovative Assignment for the **Data Analysis and Visualization (DAV)** course, AtmosIQ demonstrates the meaningful integration of **Python**, **KNIME Analytics Platform**, and **Tableau**.

---

## 🏛️ Application Architecture

```
                                 AtmosIQ Web Platform
                     (React 18 + Vite + Plotly.js + Tableau API)
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 │                       │                       │
           [Section 1]             [Section 2]             [Section 3]             [Section 4]
        Weather Overview        Explore Patterns       Tableau Dashboards      Weather Prediction
         (Python Engine)         (KNIME Engine)         (Tableau Embed)         (Scikit-Learn ML)
                 │                       │                       │                       │
          FastAPI Backend       Reads CSV Outputs     Tableau Public Embeds   Hist-Gradient Boosting
       Aggregations & Stats     data/knime_outputs/    Interactive Worksheets   Chronological 2018-19 Holdout
                 │                       │
      ┌──────────┴───────────────────────┴──────────┐
      │          Processed Data Repository          │
      │       data/processed/weather_cleaned.csv    │
      └─────────────────────────────────────────────┘
```

The application is cleanly divided into four core analytical sections plus a methodology documentation view:
1. **Weather Overview**: Python-powered daily, monthly, and annual trends, rainfall distributions, city rankings, year-month heatmaps, geographic bubble maps, and dynamic automated insights.
2. **Explore Patterns**: KNIME-powered multi-city profile comparisons (with normalized radar charts), 99th-percentile anomaly detection, and PCA dimensionality reduction (83.0% explained variance).
3. **Tableau Dashboards**: Embedded interactive dashboards utilizing the Tableau Embedding API v3, with step-by-step authoring manuals and custom URL loaders.
4. **Weather Prediction**: An academically evaluated time-series machine-learning model (MAE: 0.697°C vs Baseline 0.727°C) forecasting tomorrow's temperature from today's atmospheric state.
5. **Methodology**: Detailed documentation of datasets, preprocessing decisions, tool roles, statistical formulas, and academic caveats.

---

## 📁 Directory Structure

```
.
├── backend/                        # Python FastAPI Backend
│   ├── app.py                      # REST API endpoints & CORS middleware
│   ├── data_loader.py              # In-memory caching & friendly field mappings
│   ├── data_cleaning.py            # Preprocessing & feature engineering pipeline
│   ├── descriptive_statistics.py   # Slice aggregations & dynamic insights
│   ├── weather_analysis.py         # Plotly visualization payload generators
│   ├── city_comparison.py          # KNIME profile comparison & anomaly filters
│   ├── knime_integration.py        # KNIME workflow execution & freshness audits
│   └── prediction.py               # Time-series ML model training & evaluation
│
├── frontend/                       # React.js + Vite Frontend
│   ├── src/
│   │   ├── components/             # Reusable UI components (Navbar, ChartCard, MetricCard)
│   │   ├── pages/                  # Overview, ExplorePatterns, TableauDashboards, etc.
│   │   ├── services/api.js         # API client connecting frontend to backend
│   │   ├── styles/global.css       # Clean, minimal design system
│   │   ├── App.jsx                 # Main application layout
│   │   └── main.jsx                # React root mount
│   ├── index.html                  # HTML template with Tableau Embedding API v3
│   └── package.json                # Frontend dependencies
│
├── data/
│   ├── raw/                        # Original source CSV files
│   │   ├── cities.csv
│   │   ├── daily_data_combined_2010_to_2019.csv
│   │   └── daily_units_2010_to_2019.csv
│   ├── processed/                  # Cleaned & joined dataset (182,600 rows)
│   │   └── weather_cleaned.csv
│   └── knime_outputs/              # Exported outputs from KNIME workflows
│       ├── data_quality_report.csv
│       ├── annual_city_summary.csv
│       ├── monthly_weather_summary.csv
│       ├── weather_anomalies.csv
│       ├── city_weather_profiles.csv
│       ├── pca_projection.csv
│       └── pca_loadings.csv
│
├── TABLEAU_GUIDE.md                # Comprehensive manual for authoring Tableau views
├── KNIME_WORKFLOWS_GUIDE.md        # Node-by-node manual for KNIME Workflows A, B, and C
├── PROJECT_REPORT.md               # 16-section academic DAV project report
└── README.md                       # Installation and setup guide
```

---

## 🚀 Quickstart Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js v18+ and npm

### 1. Setup Python Virtual Environment & Backend
```bash
# From project root directory
python3 -m venv venv
source venv/bin/activate

# Install backend dependencies
pip install fastapi uvicorn scikit-learn scipy pandas numpy httpx

# Preprocess raw data and execute KNIME workflows
python backend/data_cleaning.py
python backend/knime_integration.py
python backend/prediction.py

# Start the FastAPI server on port 8000
python backend/app.py
```
*The backend API documentation is available at `http://localhost:8000/docs`.*

### 2. Setup & Start React Frontend
In a separate terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Start Vite development server
npm run dev
```
*Open your browser and navigate to `http://localhost:3000`.*

---

## 🎯 Demonstration Guide (How to Present AtmosIQ)

1. **Section 1: Weather Overview**
   - Show the summary metric cards calculated across 182,600 rows.
   - Filter by different cities (e.g., Delhi, Mumbai, Srinagar, Chennai) and demonstrate how temperature curves, rainfall bars, and dynamic automated insights recompute in real time.
   - Switch aggregation from *Monthly* to *Daily* to showcase high-density time-series rendering.
   - Hover over the interactive *Geographic Weather Distribution* bubble map to inspect regional thermal differences.

2. **Section 2: Explore Patterns (KNIME Engine)**
   - Highlight the **KNIME Workflows Active & Verified** badge and execution timestamp.
   - Under **5.1 City Weather Profiles**, compare *Delhi* vs *Mumbai* vs *Bangalore*. Review the dynamically generated comparative description and normalized radar chart.
   - Under **5.2 Unusual Weather Patterns**, filter anomalies by category (e.g., *Unusually High Temperature* in summer) and review the documented 99th-percentile statistical criteria.
   - Under **5.3 Advanced Pattern Discovery**, present the PCA 2D projection grouping the 50 cities into 4 distinct climatic zones with 83.0% cumulative explained variance.

3. **Section 3: Tableau Dashboards**
   - Switch between **Dashboard 1: Weather Overview & Trends** and **Dashboard 2: Urban Risk & Disaster Management**.
   - Show the live embedded Tableau view with full interactive brushing and tooltips.
   - Click **Tableau Authoring & Worksheets Guide** to reveal the detailed worksheet configurations, calculated fields, and publishing manual.

4. **Section 4: Weather Prediction**
   - Explain the leak-free chronological train/test split (Train: 2010–2017, Test: 2018–2019).
   - Show the evaluation scorecard where Hist-Gradient Boosting achieves **MAE 0.697°C** vs Persistence Baseline **0.727°C**.
   - Enter custom weather observations in the form, click **Estimate Next-Day Mean Temperature**, and review the predicted temperature, confidence interval, and physical interpretation.

5. **Section 5: Methodology**
   - Review the automated data quality audit table generated by KNIME Workflow A.
   - Explain the tri-technology architecture and critical academic disclaimers (correlation vs causation).

---

## 📄 Academic Integrity & Verification
- All metrics are calculated from authentic historical observations.
- Raw technical column names (`temperature_2m_mean`, `precipitation_sum`, etc.) are hidden behind a centralized mapping dictionary (`backend/data_loader.py`).
- No synthetic numbers or fake prediction evaluations are used.
