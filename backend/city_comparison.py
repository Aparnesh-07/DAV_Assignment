"""
AtmosIQ - City Comparison & Pattern Analytics
Consumes KNIME exported files to power Section 2 (Explore Patterns):
  5.1 City Weather Profiles & Comparison
  5.2 Unusual Weather Patterns (Anomalies)
  5.3 Weather Pattern Discovery (PCA & Correlations)
"""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from backend.knime_integration import read_knime_output
from backend.data_loader import load_cleaned_weather_data, get_variable_mapping

def get_city_profiles(cities: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    """Retrieve city weather profiles exported by KNIME Workflow C."""
    df = read_knime_output("city_weather_profiles.csv")
    if cities:
        df = df[df["city_name"].isin(cities)]
    return df.to_dict(orient="records")

def compare_city_profiles(city_a: str, city_b: str, city_c: Optional[str] = None) -> Dict[str, Any]:
    """
    Compare 2 or 3 cities using KNIME-generated profiles.
    Generates dynamic natural-language comparative observations and normalized radar metrics.
    """
    profiles_df = read_knime_output("city_weather_profiles.csv")
    selected_cities = [city_a, city_b]
    if city_c:
        selected_cities.append(city_c)

    matched = profiles_df[profiles_df["city_name"].isin(selected_cities)].copy()
    if matched.empty:
        return {"profiles": [], "comparisons": [], "radar": {}}

    # Dynamic plain-language comparative statements
    comparisons = []
    c_a_row = matched[matched["city_name"] == city_a]
    c_b_row = matched[matched["city_name"] == city_b]

    if not c_a_row.empty and not c_b_row.empty:
        c_a = c_a_row.iloc[0]
        c_b = c_b_row.iloc[0]

        # 1. Temperature comparison
        temp_diff = round(c_a["avg_temperature"] - c_b["avg_temperature"], 1)
        if abs(temp_diff) >= 0.5:
            warmer = city_a if temp_diff > 0 else city_b
            cooler = city_b if temp_diff > 0 else city_a
            comparisons.append(
                f"{warmer} has a higher average temperature ({max(c_a['avg_temperature'], c_b['avg_temperature'])}°C) "
                f"than {cooler} ({min(c_a['avg_temperature'], c_b['avg_temperature'])}°C), with a difference of {abs(temp_diff)}°C."
            )
        else:
            comparisons.append(
                f"{city_a} and {city_b} have remarkably similar mean temperatures ({c_a['avg_temperature']}°C vs {c_b['avg_temperature']}°C)."
            )

        # 2. Rainfall comparison
        rain_diff = round(c_a["annual_rainfall"] - c_b["annual_rainfall"], 1)
        wetter = city_a if rain_diff > 0 else city_b
        drier = city_b if rain_diff > 0 else city_a
        ratio = round(max(c_a["annual_rainfall"], c_b["annual_rainfall"]) / max(1.0, min(c_a["annual_rainfall"], c_b["annual_rainfall"])), 1)
        comparisons.append(
            f"{wetter} receives {abs(rain_diff)} mm more annual rainfall than {drier} ({ratio}× difference in precipitation volume)."
        )

        # 3. Seasonal variability comparison
        var_diff = round(c_a["seasonal_temperature_variation"] - c_b["seasonal_temperature_variation"], 1)
        if abs(var_diff) >= 1.0:
            more_seasonal = city_a if var_diff > 0 else city_b
            less_seasonal = city_b if var_diff > 0 else city_a
            comparisons.append(
                f"{more_seasonal} experiences substantially higher seasonal swings ({max(c_a['seasonal_temperature_variation'], c_b['seasonal_temperature_variation'])}°C range) "
                f"compared to {less_seasonal} ({min(c_a['seasonal_temperature_variation'], c_b['seasonal_temperature_variation'])}°C range)."
            )

    # Radar chart normalization (0 - 100 Min-Max scaled against all 50 cities)
    radar_indicators = [
        {"key": "avg_temperature", "label": "Avg Temperature", "unit": "°C"},
        {"key": "annual_rainfall", "label": "Annual Rainfall", "unit": "mm"},
        {"key": "seasonal_temperature_variation", "label": "Seasonality", "unit": "°C"},
        {"key": "daily_sunshine_hours", "label": "Daily Sunshine", "unit": "h"},
        {"key": "avg_wind_speed", "label": "Wind Speed", "unit": "km/h"}
    ]

    radar_series = []
    for _, row in matched.iterrows():
        cname = row["city_name"]
        norm_scores = []
        raw_vals = []
        for ind in radar_indicators:
            k = ind["key"]
            min_v = profiles_df[k].min()
            max_v = profiles_df[k].max()
            v = row[k]
            scaled = round(((v - min_v) / max(0.001, max_v - min_v)) * 100, 1)
            norm_scores.append(scaled)
            raw_vals.append(round(float(v), 1))

        radar_series.append({
            "city": cname,
            "normalized_values": norm_scores,
            "raw_values": raw_vals
        })

    return {
        "profiles": matched.to_dict(orient="records"),
        "comparisons": comparisons,
        "radar": {
            "categories": [ind["label"] for ind in radar_indicators],
            "units": [ind["unit"] for ind in radar_indicators],
            "series": radar_series,
            "normalization_method": "Min-Max Scaled (0-100) across all 50 Indian urban centers"
        }
    }

def get_weather_anomalies(
    city: Optional[str] = None,
    year: Optional[int] = None,
    anomaly_type: Optional[str] = None,
    limit: int = 200
) -> Dict[str, Any]:
    """
    Retrieve statistically unusual observations from KNIME Workflow B.
    """
    df = read_knime_output("weather_anomalies.csv")

    if city and city != "All":
        df = df[df["city_name"] == city]
    if year and year != 0:
        df = df[df["year"] == year]
    if anomaly_type and anomaly_type != "All":
        df = df[df["anomaly_type"] == anomaly_type]

    total_count = len(df)
    
    # Anomaly counts by year and type for summary chart
    by_year = df.groupby(["year", "anomaly_type"]).size().unstack(fill_value=0).reset_index().to_dict(orient="records")
    by_city = df.groupby("city_name").size().sort_values(ascending=False).head(10).to_dict()

    records = df.head(limit).to_dict(orient="records")

    return {
        "total_anomalies": total_count,
        "returned_records": len(records),
        "records": records,
        "by_year": by_year,
        "top_cities": by_city,
        "criteria_documentation": {
            "temperature": "Daily Max Temp >= 99th percentile of city's 10-year historical record",
            "rainfall": "Daily Rainfall >= 99th percentile and >= 50.0 mm/day",
            "wind": "Max 10m Wind Speed >= 99th percentile and >= 35.0 km/h"
        }
    }

def get_pattern_discovery() -> Dict[str, Any]:
    """
    Retrieve advanced KNIME pattern discovery: PCA projection, loadings, and correlation matrix.
    """
    proj_df = read_knime_output("pca_projection.csv")
    loadings_df = read_knime_output("pca_loadings.csv")
    raw_df = load_cleaned_weather_data()

    # Correlation matrix between core variables
    corr_cols = [
        "temperature_2m_mean",
        "apparent_temperature_mean",
        "precipitation_sum",
        "sunshine_hours",
        "wind_speed_10m_max",
        "shortwave_radiation_sum",
        "et0_fao_evapotranspiration"
    ]
    corr_matrix = raw_df[corr_cols].corr().round(3)
    labels = [get_variable_mapping(c)["label"] for c in corr_cols]

    return {
        "pca": {
            "projection": proj_df.to_dict(orient="records"),
            "loadings": loadings_df.to_dict(orient="records"),
            "explained_variance": [53.7, 29.3], # PC1: 53.7%, PC2: 29.3%, Cumulative: 83.0%
            "cumulative_variance": 83.0,
            "explanation": "PC1 captures Thermal Seasonality & Continentality (cities with large swings vs maritime equability). PC2 captures Monsoon Precipitation vs Aridity."
        },
        "correlation": {
            "variables": labels,
            "keys": corr_cols,
            "matrix": corr_matrix.values.tolist()
        }
    }
