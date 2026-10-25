import pandas as pd
import numpy as np
import json

print("=== INSPECTING CITIES METADATA ===")
cities_df = pd.read_csv("data/raw/cities.csv")
print(f"Cities shape: {cities_df.shape}")
print(cities_df.info())
print("\nCities head:")
print(cities_df.head(10))
print(f"\nUnique cities count in cities.csv: {cities_df['city_name'].nunique()}")
print(f"Missing in cities.csv:\n{cities_df.isnull().sum()}")

print("\n=== INSPECTING UNITS METADATA ===")
units_df = pd.read_csv("data/raw/daily_units_2010_to_2019.csv")
print(f"Units shape: {units_df.shape}")
print(units_df)

print("\n=== INSPECTING DAILY WEATHER DATA ===")
daily_df = pd.read_csv("data/raw/daily_data_combined_2010_to_2019.csv")
print(f"Daily shape: {daily_df.shape}")
print(f"Columns: {list(daily_df.columns)}")
print(daily_df.dtypes)

print(f"\nUnique cities in daily dataset: {daily_df['city_name'].nunique()}")
daily_cities = set(daily_df['city_name'].unique())
meta_cities = set(cities_df['city_name'].unique())
diff_1 = meta_cities - daily_cities
diff_2 = daily_cities - meta_cities
print(f"Cities in metadata but not in daily: {diff_1}")
print(f"Cities in daily but not in metadata: {diff_2}")

print("\n=== DATE RANGE & COVERAGE ===")
daily_df['datetime'] = pd.to_datetime(daily_df['datetime'])
min_date = daily_df['datetime'].min()
max_date = daily_df['datetime'].max()
total_days = (max_date - min_date).days + 1
print(f"Min Date: {min_date}, Max Date: {max_date}, Expected Days in Span: {total_days}")

city_day_counts = daily_df.groupby('city_name')['datetime'].count()
print(f"Min records per city: {city_day_counts.min()}, Max records per city: {city_day_counts.max()}")
print("Cities with counts != total_days:")
unequal_counts = city_day_counts[city_day_counts != total_days]
print(unequal_counts if len(unequal_counts) > 0 else "All cities have identical day count!")

print("\n=== DUPLICATE RECORDS ===")
duplicates = daily_df.duplicated(subset=['city_name', 'datetime']).sum()
print(f"Duplicate (city_name, datetime) rows: {duplicates}")

print("\n=== MISSING VALUES PER COLUMN ===")
null_counts = daily_df.isnull().sum()
null_pct = (null_counts / len(daily_df)) * 100
missing_summary = pd.DataFrame({'Missing Count': null_counts, 'Percentage': null_pct})
print(missing_summary[missing_summary['Missing Count'] > 0])
if (missing_summary['Missing Count'] == 0).all():
    print("Zero missing values across all columns!")

print("\n=== NUMERICAL DESCRIPTIVE STATS ===")
num_cols = daily_df.select_dtypes(include=[np.number]).columns
desc = daily_df[num_cols].describe().T[['min', 'mean', '50%', 'max', 'std']]
print(desc)

print("\n=== CHECKING SPECIFIC PLAUSIBILITY CHECKS ===")
print(f"Negative precipitation_sum: {(daily_df['precipitation_sum'] < 0).sum()}")
print(f"Negative rain_sum: {(daily_df['rain_sum'] < 0).sum()}")
print(f"Negative snowfall_sum: {(daily_df['snowfall_sum'] < 0).sum()}")
print(f"Negative daylight_duration: {(daily_df['daylight_duration'] < 0).sum()}")
print(f"Negative sunshine_duration: {(daily_df['sunshine_duration'] < 0).sum()}")
print(f"Sunshine > Daylight: {(daily_df['sunshine_duration'] > daily_df['daylight_duration']).sum()}")
print(f"Min temp > Max temp: {(daily_df['temperature_2m_min'] > daily_df['temperature_2m_max']).sum()}")
print(f"Min temp > Mean temp: {(daily_df['temperature_2m_min'] > daily_df['temperature_2m_mean']).sum()}")
print(f"Mean temp > Max temp: {(daily_df['temperature_2m_mean'] > daily_df['temperature_2m_max']).sum()}")
print(f"Extreme heat (>55 C): {(daily_df['temperature_2m_max'] > 55).sum()}")
print(f"Extreme cold (<-20 C): {(daily_df['temperature_2m_min'] < -20).sum()}")
