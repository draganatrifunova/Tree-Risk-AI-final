import os
import pickle

import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

try:
    from .generate_dataset import REQUIRED_COLUMNS, generate_synthetic_dataset
except ImportError:
    from generate_dataset import REQUIRED_COLUMNS, generate_synthetic_dataset


DATASET_PATH = "ai/tree_risk_dataset.csv"
MODEL_PATH = "ai/model.pkl"


def load_dataset(path=DATASET_PATH):
    if not os.path.exists(path):
        generate_synthetic_dataset(output_path=path)
    df = pd.read_csv(path)
    if any(col not in df.columns for col in REQUIRED_COLUMNS):
        generate_synthetic_dataset(output_path=path)
        df = pd.read_csv(path)
    return df


def train_model():
    df = load_dataset()
    x = df[["height", "tilt", "health_condition", "wind_speed", "precipitation"]]
    y = df["risk_score"]
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=200, random_state=42)
    model.fit(x_train, y_train)
    preds = model.predict(x_test)
    mae = mean_absolute_error(y_test, preds)
    with open(MODEL_PATH, "wb") as file:
        pickle.dump(model, file)
    return mae


if __name__ == "__main__":
    mae = train_model()
    print(f"Model trained. MAE={mae:.3f}")
