
"""
risk_model.py
=============
Handles the full ML lifecycle for tree-risk prediction:

    1. load_dataset()   – loads (or auto-generates) the CSV dataset
    2. train_model()    – trains a RandomForestRegressor and saves model.pkl
    3. load_model()     – loads model.pkl from disk (with a fallback flag)
    4. predict()        – runs inference; falls back to the deterministic
                          formula when no model file is present

The module is designed to be:
  • importable from Django views (as a package: `from ai.risk_model import predict`)
  • runnable standalone (python risk_model.py) to retrain the model
"""

from __future__ import annotations

import os
import pickle
import logging

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

# ── sibling-module import handles both package and standalone usage ─────────
try:
    from .generate_dataset import REQUIRED_COLUMNS, generate_synthetic_dataset
except ImportError:
    from generate_dataset import REQUIRED_COLUMNS, generate_synthetic_dataset

logger = logging.getLogger(__name__)

# ── paths (relative to the Django backend root) ───────────────────────────
DATASET_PATH = os.path.join("ai", "tree_risk_dataset.csv")
MODEL_PATH   = os.path.join("ai", "model.pkl")

# ── feature columns the model expects (ORDER MATTERS for numpy arrays) ────
FEATURE_COLUMNS = ["height", "tilt", "health_condition", "wind_speed", "precipitation"]

# ── health-condition string → numeric mapping (mirrors risk/services.py) ──
HEALTH_MAP = {"GOOD": 0, "FAIR": 1, "POOR": 2}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1. Dataset
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def load_dataset(path: str = DATASET_PATH) -> pd.DataFrame:
    """
    Load the CSV dataset.  If the file is missing or has wrong columns,
    regenerate it automatically from the synthetic generator.
    """
    needs_regen = False

    if not os.path.exists(path):
        logger.info("[risk_model] Dataset not found – generating synthetic data …")
        needs_regen = True
    else:
        df = pd.read_csv(path)
        if any(col not in df.columns for col in REQUIRED_COLUMNS):
            logger.warning("[risk_model] Dataset columns mismatch – regenerating …")
            needs_regen = True

    if needs_regen:
        generate_synthetic_dataset(output_path=path)

    df = pd.read_csv(path)
    logger.info("[risk_model] Loaded dataset: %d rows, %d columns", len(df), len(df.columns))
    return df


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 2. Training
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def train_model(
    dataset_path: str = DATASET_PATH,
    model_path:   str = MODEL_PATH,
    n_estimators: int = 200,
    test_size:  float = 0.20,
    random_state: int = 42,
) -> dict:
    """
    Train a RandomForestRegressor and persist it to *model_path*.

    Returns a dict with evaluation metrics:
        {
          "mae":         float,   # mean absolute error on held-out test set
          "r2":          float,   # R² on held-out test set
          "train_rows":  int,
          "test_rows":   int,
          "model_path":  str,
        }
    """
    df = load_dataset(dataset_path)

    X = df[FEATURE_COLUMNS]
    y = df["risk_score"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )

    model = RandomForestRegressor(
        n_estimators=n_estimators,
        random_state=random_state,
        n_jobs=-1,            # use all CPU cores
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2  = r2_score(y_test, preds)

    # ── save model ────────────────────────────────────────────────────────
    os.makedirs(os.path.dirname(model_path) or ".", exist_ok=True)
    with open(model_path, "wb") as fh:
        pickle.dump(model, fh)

    metrics = {
        "mae":        round(mae, 4),
        "r2":         round(r2,  4),
        "train_rows": len(X_train),
        "test_rows":  len(X_test),
        "model_path": model_path,
    }
    logger.info("[risk_model] Training complete: %s", metrics)
    return metrics


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 3. Loading
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def load_model(model_path: str = MODEL_PATH):
    """
    Load and return the trained model from *model_path*.

    Returns
    -------
    model   : the sklearn estimator, or None if the file does not exist.
    """
    if not os.path.exists(model_path):
        logger.warning("[risk_model] model.pkl not found at '%s'. Use train_model() first.", model_path)
        return None

    with open(model_path, "rb") as fh:
        model = pickle.load(fh)

    logger.info("[risk_model] Model loaded from '%s'.", model_path)
    return model


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 4. Prediction (with deterministic fallback)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _deterministic_score(
    height: float,
    tilt: float,
    health_condition: int,
    wind_speed: float,
    precipitation: float,
) -> float:
    """Rule-based fallback (no model required)."""
    score = (
        height          * 0.25
        + tilt          * 1.60
        + health_condition * 12.00
        + wind_speed    * 1.30
        + precipitation * 0.80
    )
    return float(max(0.0, min(100.0, score)))


def predict(
    height: float,
    tilt: float,
    health_condition: "int | str",
    wind_speed: float,
    precipitation: float,
    model_path: str = MODEL_PATH,
) -> dict:
    """
    Predict tree-risk score for a single observation.

    Parameters
    ----------
    height           : tree height in metres
    tilt             : trunk tilt in degrees
    health_condition : 0/1/2  OR  "GOOD"/"FAIR"/"POOR"
    wind_speed       : wind speed in m/s
    precipitation    : precipitation in mm/h
    model_path       : path to the pickled model (auto-detected)

    Returns
    -------
    {
      "risk_score":  float,       # 0–100
      "source":      "ml" | "deterministic",
      "model_path":  str | None,
    }
    """
    # normalise health_condition to int
    if isinstance(health_condition, str):
        health_condition = HEALTH_MAP.get(health_condition.upper(), 1)

    features = pd.DataFrame(
        [[height, tilt, health_condition, wind_speed, precipitation]],
        columns=FEATURE_COLUMNS,
    )

    model = load_model(model_path)
    if model is not None:
        raw = float(model.predict(features)[0])
        score = round(max(0.0, min(100.0, raw)), 2)
        source = "ml"
    else:
        score = round(_deterministic_score(height, tilt, health_condition, wind_speed, precipitation), 2)
        source = "deterministic"

    return {
        "risk_score": score,
        "source": source,
        "model_path": model_path if source == "ml" else None,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CLI entry-point
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(message)s")

    print("=" * 55)
    print("  Tree-Risk ML Model  –  Training Pipeline")
    print("=" * 55)

    metrics = train_model()
    print(f"\n  ✔ Model saved  →  {metrics['model_path']}")
    print(f"  ✔ MAE          →  {metrics['mae']}")
    print(f"  ✔ R²           →  {metrics['r2']}")
    print(f"  ✔ Train rows   →  {metrics['train_rows']}")
    print(f"  ✔ Test  rows   →  {metrics['test_rows']}")

    # Quick smoke-test
    print("\n  --- Smoke test ---")
    examples = [
        (5,  2,  "GOOD", 3,  10),
        (20, 20, "FAIR", 18, 40),
        (35, 40, "POOR", 30, 90),
    ]
    for h, t, hc, w, p in examples:
        result = predict(h, t, hc, w, p)
        print(
            f"  height={h:4} tilt={t:3} health={hc:4}  "
            f"wind={w:4} precip={p:3}  →  "
            f"score={result['risk_score']:6.2f}  [{result['source']}]"
        )
