import os
import pickle

import numpy as np
from django.conf import settings

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

HEIGHT_MAX = 50.0    # meters — tall tree upper bound
TILT_MAX = 45.0      # degrees — beyond 45° is structurally critical
WIND_MAX = 35.0      # m/s — Beaufort 12 / hurricane force
PRECIP_MAX = 100.0   # mm/h — extreme rainfall

HEALTH_MAP = {"GOOD": 0, "FAIR": 1, "POOR": 2}
HEALTH_FACTOR = {"GOOD": 0.0, "FAIR": 0.5, "POOR": 1.0}

WEIGHTS = {
    "ai_vision": 0.40,
    "tilt":      0.20,
    "health":    0.15,
    "weather":   0.15,
    "height":    0.10,
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _normalize(value, max_val):
    return max(0.0, min(1.0, float(value) / float(max_val)))


def compute_weather_factor(wind_speed, precipitation, storm_indicator, forecast_max_wind=None):
    wind_f = _normalize(wind_speed, WIND_MAX)
    precip_f = _normalize(precipitation, PRECIP_MAX)
    storm_f = 1.0 if storm_indicator else 0.0
    base = 0.6 * wind_f + 0.3 * precip_f + 0.1 * storm_f
    if forecast_max_wind and forecast_max_wind > wind_speed:
        forecast_f = _normalize(forecast_max_wind, WIND_MAX)
        base = max(base, 0.6 * forecast_f + 0.3 * precip_f + 0.1 * storm_f)
    return base


# ---------------------------------------------------------------------------
# Primary: hybrid score
# ---------------------------------------------------------------------------

def hybrid_risk_score(tree, weather_snapshot):
    ai_factor = (tree.ai_vision_score if tree.ai_vision_score is not None else 50.0) / 100.0
    height_factor = _normalize(tree.height, HEIGHT_MAX)
    tilt_factor = _normalize(tree.tilt, TILT_MAX)
    health_factor = HEALTH_FACTOR.get(tree.health_condition, 0.5)
    weather_factor = compute_weather_factor(
        weather_snapshot.wind_speed,
        weather_snapshot.precipitation,
        weather_snapshot.storm_indicator,
        getattr(weather_snapshot, "forecast_max_wind_24h", None),
    )

    score = (
        WEIGHTS["ai_vision"] * ai_factor
        + WEIGHTS["tilt"]      * tilt_factor
        + WEIGHTS["health"]    * health_factor
        + WEIGHTS["weather"]   * weather_factor
        + WEIGHTS["height"]    * height_factor
    ) * 100.0

    return round(max(0.0, min(100.0, score)), 2)


def score_breakdown(tree, weather_snapshot):
    """Returns per-component contributions (weight × factor) for explainability."""
    ai_factor = (tree.ai_vision_score if tree.ai_vision_score is not None else 50.0) / 100.0
    height_factor = _normalize(tree.height, HEIGHT_MAX)
    tilt_factor = _normalize(tree.tilt, TILT_MAX)
    health_factor = HEALTH_FACTOR.get(tree.health_condition, 0.5)
    weather_factor = compute_weather_factor(
        weather_snapshot.wind_speed,
        weather_snapshot.precipitation,
        weather_snapshot.storm_indicator,
        getattr(weather_snapshot, "forecast_max_wind_24h", None),
    )
    return {
        "ai_vision": round(WEIGHTS["ai_vision"] * ai_factor, 4),
        "tilt":      round(WEIGHTS["tilt"]      * tilt_factor, 4),
        "health":    round(WEIGHTS["health"]    * health_factor, 4),
        "weather":   round(WEIGHTS["weather"]   * weather_factor, 4),
        "height":    round(WEIGHTS["height"]    * height_factor, 4),
    }


def score_to_category(score):
    if score <= 35:
        return "LOW"
    if score <= 65:
        return "MEDIUM"
    return "HIGH"


# ---------------------------------------------------------------------------
# Legacy fallbacks (kept for backward compatibility / direct ML calls)
# ---------------------------------------------------------------------------

def deterministic_score(height, tilt, health_condition, wind_speed, precipitation):
    health_factor = HEALTH_MAP.get(health_condition, 1) * 12
    score = (
        (height * 0.25)
        + (tilt * 1.6)
        + (wind_speed * 1.3)
        + (precipitation * 0.8)
        + health_factor
    )
    return max(0, min(100, score))


def ml_score(height, tilt, health_condition, wind_speed, precipitation):
    model_path = os.path.join(settings.BASE_DIR, "ai", "model.pkl")
    if not os.path.exists(model_path):
        return deterministic_score(height, tilt, health_condition, wind_speed, precipitation)
    with open(model_path, "rb") as f:
        model = pickle.load(f)
    features = np.array([[height, tilt, HEALTH_MAP.get(health_condition, 1), wind_speed, precipitation]])
    pred = float(model.predict(features)[0])
    return max(0, min(100, pred))
