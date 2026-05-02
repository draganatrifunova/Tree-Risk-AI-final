import os
import pickle

import numpy as np
from django.conf import settings


HEALTH_MAP = {"GOOD": 0, "FAIR": 1, "POOR": 2}


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


def score_to_category(score):
    if score <= 33:
        return "LOW"
    if score <= 66:
        return "MEDIUM"
    return "HIGH"


def ml_score(height, tilt, health_condition, wind_speed, precipitation):
    model_path = os.path.join(settings.BASE_DIR, "ai", "model.pkl")
    if not os.path.exists(model_path):
        return deterministic_score(height, tilt, health_condition, wind_speed, precipitation)
    with open(model_path, "rb") as file:
        model = pickle.load(file)
    features = np.array(
        [[height, tilt, HEALTH_MAP.get(health_condition, 1), wind_speed, precipitation]]
    )
    pred = float(model.predict(features)[0])
    return max(0, min(100, pred))
