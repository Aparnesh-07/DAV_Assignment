"""
AtmosIQ - FastAPI Backend Server
Provides clean REST API endpoints for the AtmosIQ Indian Weather Intelligence Platform.
"""

import sys
from pathlib import Path

# Add project root directory to sys.path so 'backend' package imports work cleanly
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import uvicorn

from backend.data_loader import (
    load_cities_metadata,
    VARIABLE_MAPPINGS,
    get_variable_mapping
)
from backend.descriptive_statistics import (
    compute_overview_metrics,
    generate_dynamic_insights
)
from backend.weather_analysis import (
    get_temperature_trends,
    get_rainfall_patterns,
    get_weather_across_cities,
    get_monthly_temperature_heatmap,
    get_weather_map,
    get_weather_distribution
)
from backend.city_comparison import (
    get_city_profiles,
    compare_city_profiles,
    get_weather_anomalies,
    get_pattern_discovery
)
from backend.knime_integration import (
    get_knime_status,
    read_knime_output
)
from backend.prediction import (
    get_prediction_model_metadata,
    predict_temperature
)

app = FastAPI(
    title="AtmosIQ Backend API",
    description="Indian Weather Intelligence Platform Backend API powered by FastAPI, Pandas, and Scikit-learn.",
    version="1.0.0"
)

# Enable CORS for frontend Vite development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 1. METADATA & CONFIGURATION ENDPOINTS
# ==========================================
@app.get("/api/variables")
def get_variables():
    """Return central mapping between technical column names and user-friendly labels."""
    return VARIABLE_MAPPINGS

@app.get("/api/cities")
def get_cities():
    """Return list of 50 Indian cities with coordinates, population, and rankings."""
    cities_df = load_cities_metadata()
    return cities_df.sort_values(by="rank").to_dict(orient="records")

# ==========================================
# 2. SECTION ONE: WEATHER OVERVIEW ENDPOINTS
# ==========================================
@app.get("/api/overview")
def get_overview(
    cities: Optional[str] = Query(None, description="Comma-separated city names"),
    start_year: int = Query(2010, ge=2010, le=2019),
    end_year: int = Query(2019, ge=2010, le=2019),
    months: Optional[str] = Query(None, description="Comma-separated month numbers 1-12")
):
    """Retrieve overview summary cards and dynamic insights for the filtered slice."""
    city_list = [c.strip() for c in cities.split(",")] if cities else None
    month_list = [int(m.strip()) for m in months.split(",")] if months else None

    metrics = compute_overview_metrics(city_list, start_year, end_year, month_list)
    insights = generate_dynamic_insights(city_list, start_year, end_year, month_list)

    return {
        "metrics": metrics,
        "insights": insights,
        "filters_applied": {
            "cities": city_list or "All 50 Cities",
            "year_range": f"{start_year} - {end_year}",
            "months": month_list or "All Months"
        }
    }

@app.get("/api/weather/trends")
def get_trends(
    city: str = Query("Delhi"),
    start_year: int = Query(2010, ge=2010, le=2019),
    end_year: int = Query(2019, ge=2010, le=2019),
    aggregation: str = Query("monthly", pattern="^(daily|monthly|yearly)$")
):
    """Retrieve temperature trends line chart data."""
    return get_temperature_trends(city, start_year, end_year, aggregation)

@app.get("/api/weather/rainfall")
def get_rainfall(
    city: str = Query("Delhi"),
    start_year: int = Query(2010, ge=2010, le=2019),
    end_year: int = Query(2019, ge=2010, le=2019),
    mode: str = Query("average", pattern="^(average|total)$")
):
    """Retrieve monthly rainfall distribution."""
    return get_rainfall_patterns(city, start_year, end_year, mode)

@app.get("/api/weather/comparison")
def get_comparison(
    variable: str = Query("temperature_2m_mean"),
    start_year: int = Query(2010, ge=2010, le=2019),
    end_year: int = Query(2019, ge=2010, le=2019),
    sort_order: str = Query("desc", pattern="^(desc|asc)$"),
    limit: int = Query(20, ge=5, le=50)
):
    """Retrieve horizontal bar chart comparing Indian cities on a chosen variable."""
    return get_weather_across_cities(variable, start_year, end_year, sort_order, limit)

@app.get("/api/weather/heatmap")
def get_heatmap(
    city: str = Query("Delhi"),
    start_year: int = Query(2010, ge=2010, le=2019),
    end_year: int = Query(2019, ge=2010, le=2019)
):
    """Retrieve monthly temperature heatmap matrix (Year x Month)."""
    return get_monthly_temperature_heatmap(city, start_year, end_year)

@app.get("/api/weather/map")
def get_map(
    variable: str = Query("temperature_2m_mean"),
    start_year: int = Query(2010, ge=2010, le=2019),
    end_year: int = Query(2019, ge=2010, le=2019)
):
    """Retrieve city coordinates and weather metrics for interactive map."""
    return get_weather_map(variable, start_year, end_year)

@app.get("/api/weather/distribution")
def get_distribution(
    city: str = Query("Delhi"),
    variable: str = Query("temperature_2m_mean"),
    start_year: int = Query(2010, ge=2010, le=2019),
    end_year: int = Query(2019, ge=2010, le=2019)
):
    """Retrieve distribution statistics and histogram bins."""
    return get_weather_distribution(city, variable, start_year, end_year)

# ==========================================
# 3. SECTION TWO: EXPLORE PATTERNS (KNIME)
# ==========================================
@app.get("/api/patterns/status")
def get_patterns_status():
    """Verify KNIME file freshness, workflow names, and execution metadata."""
    return get_knime_status()

@app.get("/api/patterns/city-profiles")
def get_profiles(
    city_a: Optional[str] = Query(None),
    city_b: Optional[str] = Query(None),
    city_c: Optional[str] = Query(None)
):
    """Retrieve KNIME-generated city profiles and dynamic comparison."""
    if city_a and city_b:
        return compare_city_profiles(city_a, city_b, city_c)
    profiles = get_city_profiles()
    return {"profiles": profiles}

@app.get("/api/patterns/anomalies")
def get_anomalies(
    city: Optional[str] = Query("All"),
    year: Optional[int] = Query(0),
    anomaly_type: Optional[str] = Query("All"),
    limit: int = Query(150, ge=10, le=1000)
):
    """Retrieve statistically unusual observations isolated by KNIME Workflow B."""
    return get_weather_anomalies(city, year, anomaly_type, limit)

@app.get("/api/patterns/discovery")
def get_discovery():
    """Retrieve KNIME Workflow C advanced discovery: PCA projection, loadings, and correlation matrix."""
    return get_pattern_discovery()

@app.get("/api/patterns/data-quality")
def get_data_quality():
    """Retrieve KNIME Workflow A data quality verification report."""
    df = read_knime_output("data_quality_report.csv")
    return df.to_dict(orient="records")

# ==========================================
# 4. SECTION FOUR: PREDICTION ENDPOINTS
# ==========================================
class PredictionRequest(BaseModel):
    city_name: str = Field("Delhi", description="Target Indian city")
    current_temp: float = Field(25.0, ge=-20.0, le=55.0, description="Today's mean temperature (°C)")
    max_temp: float = Field(32.0, ge=-15.0, le=55.0, description="Today's max temperature (°C)")
    min_temp: float = Field(18.0, ge=-25.0, le=45.0, description="Today's min temperature (°C)")
    rainfall: float = Field(0.0, ge=0.0, le=600.0, description="Today's rainfall (mm)")
    wind_speed: float = Field(12.0, ge=0.0, le=150.0, description="Today's strongest wind speed (km/h)")
    solar_radiation: float = Field(18.0, ge=0.0, le=35.0, description="Today's solar radiation (MJ/m²)")
    day_of_year: int = Field(150, ge=1, le=365, description="Calendar day of year (1-365)")

@app.get("/api/prediction/metadata")
def get_prediction_metadata():
    """Retrieve ML model performance benchmark scorecard and documentation."""
    return get_prediction_model_metadata()

@app.post("/api/prediction")
def run_prediction(req: PredictionRequest):
    """Generate estimated next-day mean temperature with confidence interval."""
    if req.min_temp > req.max_temp:
        raise HTTPException(status_code=400, detail="Minimum temperature cannot be greater than Maximum temperature.")
    return predict_temperature(
        city_name=req.city_name,
        current_temp=req.current_temp,
        max_temp=req.max_temp,
        min_temp=req.min_temp,
        rainfall=req.rainfall,
        wind_speed=req.wind_speed,
        solar_radiation=req.solar_radiation,
        day_of_year=req.day_of_year
    )

if __name__ == "__main__":
    uvicorn.run("backend.app:app", host="127.0.0.1", port=8000, reload=True)
