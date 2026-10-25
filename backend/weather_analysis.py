"""
AtmosIQ - Weather Analysis & Visualization Payload Generator
Provides structured analytical payloads for Plotly.js charts in the Weather Overview section.
"""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from backend.data_loader import load_cleaned_weather_data, get_variable_mapping
from backend.descriptive_statistics import filter_dataset

def get_temperature_trends(
    city: str = "Delhi",
    start_year: int = 2010,
    end_year: int = 2019,
    aggregation: str = "monthly"  # "daily", "monthly", "yearly"
) -> Dict[str, Any]:
    """
    Generate temperature time-series series data with mean, max, and min.
    """
    df = load_cleaned_weather_data()
    cdf = df[(df["city_name"] == city) & (df["year"] >= start_year) & (df["year"] <= end_year)].copy()

    if cdf.empty:
        return {"dates": [], "mean": [], "max": [], "min": [], "city": city, "aggregation": aggregation}

    if aggregation == "yearly":
        agg_df = cdf.groupby("year").agg(
            mean_temp=("temperature_2m_mean", "mean"),
            max_temp=("temperature_2m_max", "max"),
            min_temp=("temperature_2m_min", "min")
        ).reset_index()
        dates = [str(y) for y in agg_df["year"]]
    elif aggregation == "monthly":
        agg_df = cdf.groupby(pd.Grouper(key="datetime", freq="MS")).agg(
            mean_temp=("temperature_2m_mean", "mean"),
            max_temp=("temperature_2m_max", "max"),
            min_temp=("temperature_2m_min", "min")
        ).reset_index()
        dates = [d.strftime("%Y-%m") for d in agg_df["datetime"]]
    else:  # daily
        agg_df = cdf.sort_values(by="datetime")
        dates = [d.strftime("%Y-%m-%d") for d in agg_df["datetime"]]
        agg_df["mean_temp"] = agg_df["temperature_2m_mean"]
        agg_df["max_temp"] = agg_df["temperature_2m_max"]
        agg_df["min_temp"] = agg_df["temperature_2m_min"]

    return {
        "city": city,
        "aggregation": aggregation,
        "dates": dates,
        "mean": [round(float(v), 2) for v in agg_df["mean_temp"]],
        "max": [round(float(v), 2) for v in agg_df["max_temp"]],
        "min": [round(float(v), 2) for v in agg_df["min_temp"]],
        "variable": get_variable_mapping("temperature_2m_mean")
    }

def get_rainfall_patterns(
    city: str = "Delhi",
    start_year: int = 2010,
    end_year: int = 2019,
    mode: str = "average"  # "average" (typical monthly rainfall across years) or "total" (cumulative sum)
) -> Dict[str, Any]:
    """
    Generate monthly rainfall distribution (calendar months Jan-Dec).
    """
    df = load_cleaned_weather_data()
    cdf = df[(df["city_name"] == city) & (df["year"] >= start_year) & (df["year"] <= end_year)]

    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    num_years = max(1, end_year - start_year + 1)

    monthly_totals = cdf.groupby("month")["precipitation_sum"].sum()
    monthly_data = []

    for m in range(1, 13):
        tot = float(monthly_totals.get(m, 0.0))
        val = (tot / num_years) if mode == "average" else tot
        monthly_data.append(round(val, 2))

    return {
        "city": city,
        "mode": mode,
        "months": month_names,
        "rainfall": monthly_data,
        "unit": "mm",
        "description": f"{'Typical average' if mode == 'average' else 'Total cumulative'} rainfall across {num_years} year{'s' if num_years > 1 else ''}"
    }

def get_weather_across_cities(
    variable: str = "temperature_2m_mean",
    start_year: int = 2010,
    end_year: int = 2019,
    sort_order: str = "desc", # "desc" or "asc"
    limit: int = 20
) -> Dict[str, Any]:
    """
    Generate horizontal bar chart comparing Indian cities for a selected weather metric.
    """
    df = load_cleaned_weather_data()
    filtered = df[(df["year"] >= start_year) & (df["year"] <= end_year)]

    if variable == "precipitation_sum":
        # For precipitation, compute average annual rainfall per city
        num_years = max(1, end_year - start_year + 1)
        city_metric = filtered.groupby("city_name")["precipitation_sum"].sum() / num_years
    else:
        city_metric = filtered.groupby("city_name")[variable].mean()

    city_metric = city_metric.sort_values(ascending=(sort_order == "asc"))
    if limit > 0:
        city_metric = city_metric.head(limit)

    meta = get_variable_mapping(variable)
    return {
        "variable": variable,
        "label": meta["label"] if variable != "precipitation_sum" else "Annual Average Rainfall",
        "unit": meta["unit"],
        "cities": list(city_metric.index),
        "values": [round(float(v), 2) for v in city_metric.values]
    }

def get_monthly_temperature_heatmap(
    city: str = "Delhi",
    start_year: int = 2010,
    end_year: int = 2019
) -> Dict[str, Any]:
    """
    Generate a heatmap matrix of Year x Month for mean temperature.
    """
    df = load_cleaned_weather_data()
    cdf = df[(df["city_name"] == city) & (df["year"] >= start_year) & (df["year"] <= end_year)]

    piv = cdf.pivot_table(index="year", columns="month", values="temperature_2m_mean", aggfunc="mean")
    years = [int(y) for y in piv.index]
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    # Fill matrix
    z_matrix = []
    for yr in years:
        row_vals = []
        for m in range(1, 13):
            val = piv.loc[yr, m] if (yr in piv.index and m in piv.columns) else np.nan
            row_vals.append(round(float(val), 2) if not np.isnan(val) else None)
        z_matrix.append(row_vals)

    return {
        "city": city,
        "years": years,
        "months": months,
        "z": z_matrix,
        "unit": "°C",
        "min": float(cdf["temperature_2m_mean"].min()),
        "max": float(cdf["temperature_2m_mean"].max())
    }

def get_weather_map(
    variable: str = "temperature_2m_mean",
    start_year: int = 2010,
    end_year: int = 2019
) -> Dict[str, Any]:
    """
    Generate geographical coordinates and metric values for all 50 cities.
    """
    df = load_cleaned_weather_data()
    filtered = df[(df["year"] >= start_year) & (df["year"] <= end_year)]

    num_years = max(1, end_year - start_year + 1)
    if variable == "precipitation_sum":
        agg = filtered.groupby("city_name").agg(
            metric_val=("precipitation_sum", lambda s: s.sum() / num_years),
            lat=("latitude", "first"),
            lon=("longitude", "first"),
            population=("population", "first"),
            rank=("rank", "first")
        ).reset_index()
    else:
        agg = filtered.groupby("city_name").agg(
            metric_val=(variable, "mean"),
            lat=("latitude", "first"),
            lon=("longitude", "first"),
            population=("population", "first"),
            rank=("rank", "first")
        ).reset_index()

    meta = get_variable_mapping(variable)
    label = meta["label"] if variable != "precipitation_sum" else "Annual Average Rainfall"

    cities_data = []
    for _, r in agg.iterrows():
        cities_data.append({
            "city_name": str(r["city_name"]),
            "rank": int(r["rank"]),
            "lat": float(r["lat"]),
            "lon": float(r["lon"]),
            "population": int(r["population"]),
            "value": round(float(r["metric_val"]), 2)
        })

    return {
        "variable": variable,
        "label": label,
        "unit": meta["unit"],
        "cities": cities_data
    }

def get_weather_distribution(
    city: str = "Delhi",
    variable: str = "temperature_2m_mean",
    start_year: int = 2010,
    end_year: int = 2019
) -> Dict[str, Any]:
    """
    Generate distribution metrics: histogram bins and five-number summary (box-plot).
    """
    df = load_cleaned_weather_data()
    cdf = df[(df["city_name"] == city) & (df["year"] >= start_year) & (df["year"] <= end_year)]

    series = cdf[variable].dropna()
    if series.empty:
        return {"city": city, "variable": variable, "stats": {}, "histogram": {}}

    meta = get_variable_mapping(variable)
    stats = {
        "min": round(float(series.min()), 2),
        "q1": round(float(series.quantile(0.25)), 2),
        "median": round(float(series.median()), 2),
        "mean": round(float(series.mean()), 2),
        "q3": round(float(series.quantile(0.75)), 2),
        "max": round(float(series.max()), 2),
        "std": round(float(series.std()), 2)
    }

    # Compute histogram bins (20 bins)
    counts, bin_edges = np.histogram(series, bins=20)
    bin_centers = [round(float((bin_edges[i] + bin_edges[i+1]) / 2.0), 2) for i in range(len(counts))]

    return {
        "city": city,
        "variable": variable,
        "label": meta["label"],
        "unit": meta["unit"],
        "stats": stats,
        "histogram": {
            "bin_centers": bin_centers,
            "counts": [int(c) for c in counts]
        }
    }
