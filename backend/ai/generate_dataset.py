"""
generate_dataset.py
===================
Generates a synthetic tree-risk dataset and saves it as a CSV file.

Features
--------
height          : float  — tree height in metres (2–40 m)
tilt            : float  — trunk tilt in degrees (0–45°)
health_condition: int    — 0=GOOD, 1=FAIR, 2=POOR
wind_speed      : float  — current wind speed in m/s (0–35)
precipitation   : float  — current precipitation in mm/h (0–120)

Label
-----
risk_score      : float  — 0–100 (higher = more dangerous)

The score formula mirrors the deterministic model in risk/services.py so the
ML model learns to replicate real business logic plus realistic noise.
"""

import os
import numpy as np
import pandas as pd

# ── column contract used by risk_model.py ──────────────────────────────────
REQUIRED_COLUMNS = [
    "height",
    "tilt",
    "health_condition",
    "wind_speed",
    "precipitation",
    "risk_score",
]


def generate_synthetic_dataset(rows: int = 1000, output_path: str = "ai/tree_risk_dataset.csv") -> str:
    """
    Create a labelled dataset of synthetic tree observations.

    Parameters
    ----------
    rows        : number of samples to generate
    output_path : where to write the CSV (relative to the backend root)

    Returns
    -------
    The output path that was written.
    """
    rng = np.random.default_rng(seed=42)

    # ── input features ────────────────────────────────────────────────────
    height = rng.uniform(2, 40, rows)                          # metres
    tilt = rng.uniform(0, 45, rows)                            # degrees
    health_condition = rng.choice([0, 1, 2], rows, p=[0.45, 0.35, 0.20])
    wind_speed = rng.uniform(0, 35, rows)                      # m/s
    precipitation = rng.uniform(0, 120, rows)                  # mm/h

    # ── deterministic base score (business logic) ─────────────────────────
    base_score = (
        height          * 0.25
        + tilt          * 1.60
        + health_condition * 12.00
        + wind_speed    * 1.30
        + precipitation * 0.80
    )

    # ── realistic noise (±3 pts std-dev) ──────────────────────────────────
    noise = rng.normal(loc=0, scale=3.0, size=rows)
    risk_score = np.clip(base_score + noise, 0, 100)

    # ── assemble dataframe ────────────────────────────────────────────────
    df = pd.DataFrame(
        {
            "height": height,
            "tilt": tilt,
            "health_condition": health_condition,
            "wind_speed": wind_speed,
            "precipitation": precipitation,
            "risk_score": risk_score,
        }
    )

    # ── persist ───────────────────────────────────────────────────────────
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"[generate_dataset] Saved {len(df)} rows → {output_path}")
    return output_path


if __name__ == "__main__":
    generate_synthetic_dataset()
