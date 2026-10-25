"""
AtmosIQ - Descriptive Statistics & Dynamic Insights Generator
Computes summary metric cards and dynamic insights for the Overview section.
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

def filter_dataset(
    df: pd.DataFrame,
    cities: Optional[List[str]] = None,
    start_year: Optional[int] = None,
    end_year: Optional[int] = None,
    months: Optional[List[int]] = None
) -> pd.DataFrame:
    """Filter weather dataframe by cities, year range, and months."""
    filtered = df
    if cities:
        filtered = filtered[filtered["city_name"].isin(cities)]
    if start_year is not None:
        filtered = filtered[filtered["year"] >= start_year]
    if end_year is not None:
        filtered = filtered[filtered["year"] <= end_year]
    if months:
        filtered = filtered[filtered["month"].isin(months)]
    return filtered

def compute_overview_metrics(
    cities: Optional[List[str]] = None,
    start_year: Optional[int] = None,
    end_year: Optional[int] = None,
    months: Optional[List[int]] = None
) -> Dict[str, Any]:
    """
    Calculate summary metrics for the Weather Overview header cards.
    Differentiates between daily mean temperature average and extreme records.
    """
    df = load_cleaned_weather_data()
    filtered = filter_dataset(df, cities, start_year, end_year, months)

    if filtered.empty:
        return {
            "cities_count": 0,
            "days_count": 0,
            "avg_temperature": 0.0,
            "total_rainfall": 0.0,
            "warmest_record": {"temp": 0.0, "city": "N/A", "date": "N/A"},
            "coldest_record": {"temp": 0.0, "city": "N/A", "date": "N/A"}
        }

    cities_count = filtered["city_name"].nunique()
    total_records = len(filtered)
    # Distinct calendar days in filtered view
    days_count = filtered["datetime"].nunique()

    avg_temp = round(float(filtered["temperature_2m_mean"].mean()), 1)
    
    # Total rainfall: if multiple cities are selected, we present total rainfall averaged per city
    # to avoid distorting rainfall magnitude when user selects 50 cities vs 1 city.
    total_rain_accumulated = filtered["precipitation_sum"].sum()
    avg_city_rainfall = round(float(total_rain_accumulated / max(cities_count, 1)), 1)

    # Warmest and coldest days
    warmest_idx = filtered["temperature_2m_max"].idxmax()
    coldest_idx = filtered["temperature_2m_min"].idxmin()

    warmest_row = filtered.loc[warmest_idx]
    coldest_row = filtered.loc[coldest_idx]

    return {
        "cities_count": {
            "value": cities_count,
            "label": "Cities Covered",
            "subtext": "Major Indian urban centers"
        },
        "days_count": {
            "value": days_count,
            "total_records": total_records,
            "label": "Days of Weather Data",
            "subtext": f"{total_records:,} daily observation records"
        },
        "avg_temperature": {
            "value": avg_temp,
            "unit": "°C",
            "label": "Average Temperature",
            "subtext": "Mean of daily average 2m temperatures"
        },
        "total_rainfall": {
            "value": avg_city_rainfall,
            "raw_total": round(float(total_rain_accumulated), 1),
            "unit": "mm",
            "label": "Average Rainfall per City",
            "subtext": f"Across {cities_count} selected city profile{'s' if cities_count > 1 else ''}"
        },
        "warmest_record": {
            "value": round(float(warmest_row["temperature_2m_max"]), 1),
            "unit": "°C",
            "city": str(warmest_row["city_name"]),
            "date": str(warmest_row["datetime"].date()),
            "label": "Warmest Recorded Day",
            "subtext": f"{warmest_row['city_name']} ({warmest_row['datetime'].strftime('%d %b %Y')})"
        },
        "coldest_record": {
            "value": round(float(coldest_row["temperature_2m_min"]), 1),
            "unit": "°C",
            "city": str(coldest_row["city_name"]),
            "date": str(coldest_row["datetime"].date()),
            "label": "Coldest Recorded Day",
            "subtext": f"{coldest_row['city_name']} ({coldest_row['datetime'].strftime('%d %b %Y')})"
        }
    }

def generate_dynamic_insights(
    cities: Optional[List[str]] = None,
    start_year: Optional[int] = None,
    end_year: Optional[int] = None,
    months: Optional[List[int]] = None
) -> List[Dict[str, str]]:
    """
    Generate dynamic observations based strictly on the current filtered dataset.
    Never hardcoded; calculated from the slice.
    """
    df = load_cleaned_weather_data()
    filtered = filter_dataset(df, cities, start_year, end_year, months)

    if filtered.empty:
        return []

    insights = []

    # 1. Warmest city in the selection
    city_temps = filtered.groupby("city_name")["temperature_2m_mean"].mean()
    warmest_city = city_temps.idxmax()
    warmest_temp = round(float(city_temps.max()), 1)
    coolest_city = city_temps.idxmin()
    coolest_temp = round(float(city_temps.min()), 1)

    insights.append({
        "category": "Thermal Extremes",
        "title": f"Warmest & Coolest Cities in Selection",
        "text": f"During the selected period, {warmest_city} recorded the highest average temperature at {warmest_temp}°C, while {coolest_city} recorded the lowest at {coolest_temp}°C (a thermal difference of {round(warmest_temp - coolest_temp, 1)}°C)."
    })

    # 2. Wettest month pattern
    month_names = {1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June",
                   7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December"}
    monthly_rain = filtered.groupby("month")["precipitation_sum"].sum()
    if not monthly_rain.empty:
        wettest_m_num = monthly_rain.idxmax()
        wettest_m_name = month_names.get(wettest_m_num, str(wettest_m_num))
        wettest_m_pct = round((monthly_rain.max() / max(monthly_rain.sum(), 0.001)) * 100, 1)
        insights.append({
            "category": "Precipitation Concentration",
            "title": f"Peak Rainfall Period",
            "text": f"{wettest_m_name} contributed the largest share of precipitation ({wettest_m_pct}% of total selected rainfall), reflecting the seasonal monsoon rhythm."
        })

    # 3. Year-to-year variation
    annual_means = filtered.groupby("year")["temperature_2m_mean"].mean()
    if len(annual_means) > 1:
        warmest_yr = annual_means.idxmax()
        warmest_yr_val = round(float(annual_means.max()), 2)
        coolest_yr = annual_means.idxmin()
        coolest_yr_val = round(float(annual_means.min()), 2)
        insights.append({
            "category": "Inter-annual Fluctuation",
            "title": f"Warmest Calendar Year",
            "text": f"Across the selected years, {warmest_yr} had the highest annual mean temperature ({warmest_yr_val}°C), compared to {coolest_yr} which had the coolest annual mean ({coolest_yr_val}°C)."
        })

    # 4. Seasonal Range
    if filtered["city_name"].nunique() > 1:
        # Compute range between warmest and coldest months per city
        city_monthly = filtered.groupby(["city_name", "month"])["temperature_2m_mean"].mean().reset_index()
        city_ranges = city_monthly.groupby("city_name")["temperature_2m_mean"].agg(lambda s: s.max() - s.min())
        highest_var_city = city_ranges.idxmax()
        highest_var_val = round(float(city_ranges.max()), 1)
        lowest_var_city = city_ranges.idxmin()
        lowest_var_val = round(float(city_ranges.min()), 1)
        insights.append({
            "category": "Continentality & Seasonality",
            "title": f"Seasonal Temperature Amplitude",
            "text": f"{highest_var_city} exhibits the highest seasonal amplitude ({highest_var_val}°C between warmest and coldest months), whereas coastal {lowest_var_city} exhibits maritime moderation ({lowest_var_val}°C range)."
        })

    return insights
