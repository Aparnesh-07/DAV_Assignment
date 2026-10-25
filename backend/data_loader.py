"""
AtmosIQ - Data Loader & Variable Mappings
Provides centralized variable metadata, friendly labels, units, and dataset caching.
"""

from pathlib import Path
import unicodedata
import pandas as pd
from typing import Dict, Any, Optional

def normalize_city_name(name: str) -> str:
    """Strip diacritical macrons (e.g., ā -> a, ī -> i, ū -> u) from city names."""
    nfkd = unicodedata.normalize('NFKD', str(name))
    return ''.join(c for c in nfkd if not unicodedata.combining(c))

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"
KNIME_DIR = BASE_DIR / "data" / "knime_outputs"

# Centralized mapping from raw technical field names to human-readable names and units
VARIABLE_MAPPINGS: Dict[str, Dict[str, str]] = {
    "temperature_2m_mean": {
        "label": "Average Temperature",
        "unit": "°C",
        "short": "Avg Temp",
        "description": "Daily mean 2-meter air temperature"
    },
    "temperature_2m_max": {
        "label": "Maximum Temperature",
        "unit": "°C",
        "short": "Max Temp",
        "description": "Highest recorded daily temperature"
    },
    "temperature_2m_min": {
        "label": "Minimum Temperature",
        "unit": "°C",
        "short": "Min Temp",
        "description": "Lowest recorded daily temperature"
    },
    "apparent_temperature_mean": {
        "label": "Feels-Like Temperature",
        "unit": "°C",
        "short": "Feels-Like",
        "description": "Daily mean apparent temperature considering humidity and wind"
    },
    "apparent_temperature_max": {
        "label": "Maximum Feels-Like",
        "unit": "°C",
        "short": "Max Feels-Like",
        "description": "Highest apparent temperature during the day"
    },
    "apparent_temperature_min": {
        "label": "Minimum Feels-Like",
        "unit": "°C",
        "short": "Min Feels-Like",
        "description": "Lowest apparent temperature during the day"
    },
    "precipitation_sum": {
        "label": "Daily Rainfall",
        "unit": "mm",
        "short": "Rainfall",
        "description": "Total precipitation accumulated over 24 hours"
    },
    "rain_sum": {
        "label": "Liquid Rainfall",
        "unit": "mm",
        "short": "Rain",
        "description": "Liquid precipitation portion"
    },
    "snowfall_sum": {
        "label": "Snowfall",
        "unit": "cm",
        "short": "Snow",
        "description": "Accumulated daily snowfall depth"
    },
    "precipitation_hours": {
        "label": "Rainfall Duration",
        "unit": "hours",
        "short": "Rain Hours",
        "description": "Number of hours with measurable precipitation"
    },
    "wind_speed_10m_max": {
        "label": "Strongest Daily Wind",
        "unit": "km/h",
        "short": "Max Wind",
        "description": "Maximum 10-meter sustained wind speed"
    },
    "wind_gusts_10m_max": {
        "label": "Peak Wind Gust",
        "unit": "km/h",
        "short": "Wind Gust",
        "description": "Peak instantaneous wind gust speed"
    },
    "wind_direction_10m_dominant": {
        "label": "Dominant Wind Direction",
        "unit": "°",
        "short": "Wind Dir",
        "description": "Prevailing wind direction in degrees (0° = North, 90° = East)"
    },
    "daylight_hours": {
        "label": "Daylight Duration",
        "unit": "hours",
        "short": "Daylight",
        "description": "Total hours between astronomical sunrise and sunset"
    },
    "sunshine_hours": {
        "label": "Sunshine Duration",
        "unit": "hours",
        "short": "Sunshine",
        "description": "Hours of direct solar irradiance exceeding 120 W/m²"
    },
    "shortwave_radiation_sum": {
        "label": "Solar Radiation",
        "unit": "MJ/m²",
        "short": "Solar Rad",
        "description": "Total global solar irradiance reaching the ground"
    },
    "et0_fao_evapotranspiration": {
        "label": "Reference Evapotranspiration",
        "unit": "mm",
        "short": "Evapotranspiration",
        "description": "FAO-56 reference crop evapotranspiration loss"
    },
    "weather_code": {
        "label": "Weather Condition Code",
        "unit": "WMO",
        "short": "WMO Code",
        "description": "World Meteorological Organization weather category code"
    }
}

# In-memory dataframe cache
_CACHED_DF: Optional[pd.DataFrame] = None
_CACHED_CITIES_DF: Optional[pd.DataFrame] = None

def get_variable_mapping(field: str) -> Dict[str, str]:
    """Retrieve human-friendly label and unit for a technical column name."""
    return VARIABLE_MAPPINGS.get(field, {
        "label": field.replace("_", " ").title(),
        "unit": "",
        "short": field.replace("_", " ").title(),
        "description": ""
    })

def load_cities_metadata() -> pd.DataFrame:
    """Load the 50 cities metadata file with normalized city names."""
    global _CACHED_CITIES_DF
    if _CACHED_CITIES_DF is None:
        path = RAW_DIR / "cities.csv"
        df = pd.read_csv(path)
        df["city_name"] = df["city_name"].apply(normalize_city_name)
        _CACHED_CITIES_DF = df
    return _CACHED_CITIES_DF.copy()

def load_cleaned_weather_data() -> pd.DataFrame:
    """
    Load cleaned daily weather data.
    If the processed file does not exist, trigger the cleaning pipeline.
    """
    global _CACHED_DF
    if _CACHED_DF is None:
        processed_file = PROCESSED_DIR / "weather_cleaned.csv"
        if not processed_file.exists():
            from backend.data_cleaning import clean_and_process_data
            _CACHED_DF = clean_and_process_data()
        else:
            _CACHED_DF = pd.read_csv(processed_file, parse_dates=["datetime"])
    return _CACHED_DF.copy()

def clear_cache():
    """Clear memory caches if data is refreshed."""
    global _CACHED_DF, _CACHED_CITIES_DF
    _CACHED_DF = None
    _CACHED_CITIES_DF = None
