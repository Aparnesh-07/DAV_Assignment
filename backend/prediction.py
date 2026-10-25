"""
AtmosIQ - Weather Prediction Module
Rigorous, leak-free time-series forecasting for Next-Day Mean Temperature.
Uses chronological train/test split (Train: 2010-2017, Test: 2018-2019).
"""

import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import numpy as np
import pandas as pd
import joblib
from sklearn.linear_model import Ridge
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from typing import Dict, Any

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_FILE = BASE_DIR / "data" / "processed" / "weather_cleaned.csv"
MODEL_PATH = BASE_DIR / "backend" / "weather_prediction_model.joblib"

def prepare_time_series_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Construct time-series lag features strictly avoiding future lookahead leakage.
    Predicts next day mean temperature: target = temperature_2m_mean(t+1)
    """
    df = df.sort_values(by=["city_name", "datetime"]).copy()

    # Create target: next day temperature
    df["target_next_day_temp"] = df.groupby("city_name")["temperature_2m_mean"].shift(-1)

    # Cyclical day of year
    df["doy"] = df["datetime"].dt.dayofyear
    df["sin_doy"] = np.sin(2 * np.pi * df["doy"] / 365.25)
    df["cos_doy"] = np.cos(2 * np.pi * df["doy"] / 365.25)

    # Cyclical month
    df["sin_month"] = np.sin(2 * np.pi * df["month"] / 12.0)
    df["cos_month"] = np.cos(2 * np.pi * df["month"] / 12.0)

    # Diurnal range of current day
    df["diurnal_range"] = df["temperature_2m_max"] - df["temperature_2m_min"]

    # Drop the final day of each city series which has no target (NaN)
    valid_df = df.dropna(subset=["target_next_day_temp"]).copy()
    return valid_df

FEATURE_COLUMNS = [
    "temperature_2m_mean",      # current day mean temp
    "diurnal_range",            # current day max - min
    "precipitation_sum",        # current day rain
    "wind_speed_10m_max",       # current day wind
    "shortwave_radiation_sum",  # current day solar radiation
    "sin_doy", "cos_doy",       # annual solar cycle
    "sin_month", "cos_month",   # seasonal cycle
    "latitude", "longitude"     # geographical coordinates
]

def train_and_evaluate_model() -> Dict[str, Any]:
    """
    Train ML models using chronological splitting:
      Train set: 2010 to 2017 (80% chronological span)
      Test set:  2018 to 2019 (20% chronological holdout)
    Compares against Persistence Baseline.
    """
    print("Loading cleaned dataset for ML training...")
    raw_df = pd.read_csv(PROCESSED_FILE, parse_dates=["datetime"])
    df = prepare_time_series_features(raw_df)

    train_mask = df["year"] <= 2017
    test_mask = df["year"] >= 2018

    X_train = df.loc[train_mask, FEATURE_COLUMNS]
    y_train = df.loc[train_mask, "target_next_day_temp"]

    X_test = df.loc[test_mask, FEATURE_COLUMNS]
    y_test = df.loc[test_mask, "target_next_day_temp"]

    # 1. Baseline Model: Persistence (Tomorrow's temp = Today's temp)
    y_pred_baseline = df.loc[test_mask, "temperature_2m_mean"]
    base_mae = mean_absolute_error(y_test, y_pred_baseline)
    base_rmse = np.sqrt(mean_squared_error(y_test, y_pred_baseline))
    base_r2 = r2_score(y_test, y_pred_baseline)

    # 2. Linear Regularized Model: Ridge Regression
    ridge = Ridge(alpha=1.0)
    ridge.fit(X_train, y_train)
    y_pred_ridge = ridge.predict(X_test)
    ridge_mae = mean_absolute_error(y_test, y_pred_ridge)
    ridge_rmse = np.sqrt(mean_squared_error(y_test, y_pred_ridge))
    ridge_r2 = r2_score(y_test, y_pred_ridge)

    # 3. Non-linear Gradient Boosting Model: HistGradientBoostingRegressor
    gbr = HistGradientBoostingRegressor(max_iter=150, max_depth=6, random_state=42)
    gbr.fit(X_train, y_train)
    y_pred_gbr = gbr.predict(X_test)
    gbr_mae = mean_absolute_error(y_test, y_pred_gbr)
    gbr_rmse = np.sqrt(mean_squared_error(y_test, y_pred_gbr))
    gbr_r2 = r2_score(y_test, y_pred_gbr)

    # Save best model package
    model_payload = {
        "model": gbr,
        "feature_names": FEATURE_COLUMNS,
        "train_period": "2010 - 2017",
        "test_period": "2018 - 2019",
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "metrics": {
            "baseline_persistence": {
                "name": "Persistence Baseline (Tomorrow = Today)",
                "mae": round(float(base_mae), 3),
                "rmse": round(float(base_rmse), 3),
                "r2": round(float(base_r2), 3)
            },
            "ridge_regression": {
                "name": "Ridge Regularized Linear Model",
                "mae": round(float(ridge_mae), 3),
                "rmse": round(float(ridge_rmse), 3),
                "r2": round(float(ridge_r2), 3)
            },
            "gradient_boosting": {
                "name": "Hist-Gradient Boosting Regressor",
                "mae": round(float(gbr_mae), 3),
                "rmse": round(float(gbr_rmse), 3),
                "r2": round(float(gbr_r2), 3)
            }
        }
    }

    joblib.dump(model_payload, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")
    print(f"Test MAE: {gbr_mae:.3f}°C (vs Baseline {base_mae:.3f}°C)")
    print(f"Test RMSE: {gbr_rmse:.3f}°C (vs Baseline {base_rmse:.3f}°C)")
    print(f"Test R²: {gbr_r2:.3f}")

    return model_payload["metrics"]

def get_prediction_model_metadata() -> Dict[str, Any]:
    """Retrieve metadata and test benchmarks of the trained model."""
    if not MODEL_PATH.exists():
        train_and_evaluate_model()
    payload = joblib.load(MODEL_PATH)
    return {
        "task": "Next-Day Mean Air Temperature Estimation (t+1)",
        "features_used": payload["feature_names"],
        "train_period": payload["train_period"],
        "test_period": payload["test_period"],
        "train_samples": payload["train_samples"],
        "test_samples": payload["test_samples"],
        "evaluation": payload["metrics"],
        "limitations": [
            "This model estimates 24-hour mean temperature from daily historical aggregates; it does not replace multi-layer numerical weather prediction (NWP) physics engines.",
            "Predictions assume atmospheric continuity and may underestimate sudden rapid convective frontal shifts or cyclone landfalls.",
            "The model was strictly trained on 2010–2017 and evaluated on 2018–2019 out-of-sample data without data leakage."
        ]
    }

def predict_temperature(
    city_name: str,
    current_temp: float,
    max_temp: float,
    min_temp: float,
    rainfall: float,
    wind_speed: float,
    solar_radiation: float,
    day_of_year: int
) -> Dict[str, Any]:
    """
    Generate an estimated next-day mean temperature for a given city and atmospheric state.
    """
    if not MODEL_PATH.exists():
        train_and_evaluate_model()
    payload = joblib.load(MODEL_PATH)
    model = payload["model"]

    # Load city coordinates
    from backend.data_loader import load_cities_metadata
    cities_df = load_cities_metadata()
    city_row = cities_df[cities_df["city_name"] == city_name]
    if not city_row.empty:
        lat = float(city_row.iloc[0]["latitude"])
        lon = float(city_row.iloc[0]["longitude"])
    else:
        lat = 22.0
        lon = 78.0

    doy = max(1, min(365, int(day_of_year)))
    sin_doy = np.sin(2 * np.pi * doy / 365.25)
    cos_doy = np.cos(2 * np.pi * doy / 365.25)

    month = int(max(1, min(12, int(doy / 30.5) + 1)))
    sin_month = np.sin(2 * np.pi * month / 12.0)
    cos_month = np.cos(2 * np.pi * month / 12.0)

    diurnal_range = max(0.0, max_temp - min_temp)

    feature_dict = {
        "temperature_2m_mean": current_temp,
        "diurnal_range": diurnal_range,
        "precipitation_sum": max(0.0, rainfall),
        "wind_speed_10m_max": max(0.0, wind_speed),
        "shortwave_radiation_sum": max(0.0, solar_radiation),
        "sin_doy": sin_doy,
        "cos_doy": cos_doy,
        "sin_month": sin_month,
        "cos_month": cos_month,
        "latitude": lat,
        "longitude": lon
    }

    input_df = pd.DataFrame([feature_dict])[payload["feature_names"]]
    pred_val = float(model.predict(input_df)[0])
    test_rmse = float(payload["metrics"]["gradient_boosting"]["rmse"])

    # Persistence comparison
    persistence_est = current_temp
    model_delta = round(pred_val - current_temp, 2)

    return {
        "city_name": city_name,
        "estimated_next_day_temperature": round(pred_val, 1),
        "expected_range": {
            "lower": round(pred_val - test_rmse, 1),
            "upper": round(pred_val + test_rmse, 1),
            "confidence_interval": "± 1.0 RMSE (~68% statistical confidence)"
        },
        "comparison_with_persistence": {
            "persistence_value": round(persistence_est, 1),
            "model_adjustment": model_delta,
            "interpretation": f"Model forecasts a {'warming' if model_delta > 0 else 'cooling' if model_delta < 0 else 'stable'} shift of {abs(model_delta)}°C relative to today's temperature."
        },
        "model_name": "Hist-Gradient Boosting Regressor",
        "inputs_provided": {
            "city": city_name,
            "current_temp": current_temp,
            "diurnal_range": round(diurnal_range, 1),
            "rainfall": rainfall,
            "wind_speed": wind_speed,
            "solar_radiation": solar_radiation,
            "day_of_year": doy
        }
    }

if __name__ == "__main__":
    train_and_evaluate_model()
