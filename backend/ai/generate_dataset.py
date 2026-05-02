import os
import numpy as np
import pandas as pd


REQUIRED_COLUMNS = ["height", "tilt", "health_condition", "wind_speed", "precipitation", "risk_score"]


def generate_synthetic_dataset(rows=800, output_path="ai/tree_risk_dataset.csv"):
    np.random.seed(42)
    height = np.random.uniform(2, 40, rows)
    tilt = np.random.uniform(0, 45, rows)
    health_condition = np.random.choice([0, 1, 2], rows, p=[0.45, 0.35, 0.2])
    wind_speed = np.random.uniform(0, 35, rows)
    precipitation = np.random.uniform(0, 120, rows)
    risk_score = np.clip(
        (height * 0.25) + (tilt * 1.6) + (health_condition * 12) + (wind_speed * 1.3) + (precipitation * 0.8),
        0,
        100,
    )
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
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    return output_path


if __name__ == "__main__":
    print(generate_synthetic_dataset())
