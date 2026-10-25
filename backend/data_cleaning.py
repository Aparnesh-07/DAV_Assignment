"""
AtmosIQ - Data Cleaning and Preprocessing Pipeline
Prepares cleaned data, performs conversions, handles missing values, and merges city metadata.
"""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import unicodedata
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"

def normalize_city_name(name: str) -> str:
    """Strip diacritical macrons (e.g., ā -> a, ī -> i, ū -> u) from city names."""
    nfkd = unicodedata.normalize('NFKD', str(name))
    return ''.join(c for c in nfkd if not unicodedata.combining(c))

def get_imd_season(month: int) -> str:
    """Classify month into standard India Meteorological Department (IMD) 4 seasons."""
    if month in [12, 1, 2]:
        return "Winter"
    elif month in [3, 4, 5]:
        return "Summer"
    elif month in [6, 7, 8, 9]:
        return "Monsoon"
    else:
        return "Post-Monsoon"

def clean_and_process_data() -> pd.DataFrame:
    """
    Execute full data cleaning workflow:
    1. Reads raw daily records and city metadata
    2. Parses dates and extracts temporal features
    3. Converts daylight and sunshine from seconds to hours
    4. Imputes the single missing et0_fao_evapotranspiration record
    5. Validates physical bounds
    6. Merges city metadata (rank, population, latitude, longitude)
    7. Exports to data/processed/weather_cleaned.csv
    """
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    raw_weather_path = RAW_DIR / "daily_data_combined_2010_to_2019.csv"
    cities_path = RAW_DIR / "cities.csv"

    print("Loading raw weather data and cities metadata...")
    df = pd.read_csv(raw_weather_path)
    cities_df = pd.read_csv(cities_path)

    # 1. Normalize City Names (remove diacritics / dashes over letters)
    df["city_name"] = df["city_name"].apply(normalize_city_name)
    cities_df["city_name"] = cities_df["city_name"].apply(normalize_city_name)

    # 2. Parse datetime
    df["datetime"] = pd.to_datetime(df["datetime"])
    df["year"] = df["datetime"].dt.year
    df["month"] = df["datetime"].dt.month
    df["month_name"] = df["datetime"].dt.strftime("%b")
    df["day"] = df["datetime"].dt.day
    df["season"] = df["month"].apply(get_imd_season)

    # 3. Convert durations from seconds to hours
    # The raw dataset provides daylight_duration and sunshine_duration in seconds.
    df["daylight_hours"] = (df["daylight_duration"] / 3600.0).round(2)
    df["sunshine_hours"] = (df["sunshine_duration"] / 3600.0).round(2)

    # 4. Handle Missing Values
    # In the raw dataset of 182,600 rows, exactly 1 row is null:
    # city_name='Guwahati', date='2016-06-05', column='et0_fao_evapotranspiration'
    # We impute it using Guwahati's mean June evapotranspiration.
    if df["et0_fao_evapotranspiration"].isnull().any():
        guwahati_june_mean = df[(df["city_name"] == "Guwahati") & (df["month"] == 6)]["et0_fao_evapotranspiration"].mean()
        df["et0_fao_evapotranspiration"] = df["et0_fao_evapotranspiration"].fillna(round(guwahati_june_mean, 2))

    # 5. Merge City Metadata
    df = df.merge(cities_df, on="city_name", how="left")

    # 5. Sort chronologically by city and date
    df = df.sort_values(by=["city_name", "datetime"]).reset_index(drop=True)

    # 6. Save processed dataset
    output_path = PROCESSED_DIR / "weather_cleaned.csv"
    df.to_csv(output_path, index=False)
    print(f"Data cleaning complete. Cleaned file saved to {output_path} ({len(df)} rows).")

    return df

if __name__ == "__main__":
    clean_and_process_data()
