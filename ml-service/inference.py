"""Model loading and inference for the BiLSTM weather forecaster."""

import os
import pickle
from typing import List

import numpy as np
from tensorflow.keras.models import load_model

FEATURE_ORDER = ["T2M_MAX", "PRECTOTCORR", "RH2M", "GWETROOT", "T2M_MIN"]
EXPECTED_SHAPE = (12, 5)

MODEL_PATH = os.environ.get("MODEL_PATH", "../nasa_bilstm_weather_model.h5")
SCALER_PATH = os.environ.get("SCALER_PATH", "../weather_scaler.pkl")

model = None
scaler = None
model_loaded = False
_load_error = None

try:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
    if not os.path.exists(SCALER_PATH):
        raise FileNotFoundError(f"Scaler file not found: {SCALER_PATH}")
    model = load_model(MODEL_PATH)
    with open(SCALER_PATH, "rb") as fh:
        scaler = pickle.load(fh)
    model_loaded = True
except Exception as exc:  # pragma: no cover - startup failure path
    _load_error = exc
    model = None
    scaler = None
    model_loaded = False


def is_loaded() -> bool:
    return bool(model_loaded and model is not None and scaler is not None)


def get_load_error() -> Exception | None:
    return _load_error


def validate_input(historical_data: List[List[float]]) -> None:
    if not isinstance(historical_data, (list, tuple)):
        raise ValueError("historical_data must be a list of 12 arrays")
    if len(historical_data) != 12:
        raise ValueError(f"historical_data must have 12 rows, got {len(historical_data)}")
    for i, row in enumerate(historical_data):
        if not isinstance(row, (list, tuple)) or len(row) != 5:
            raise ValueError(f"row {i} must have 5 values, got {len(row) if hasattr(row, '__len__') else 'n/a'}")
        for v in row:
            if not isinstance(v, (int, float)) or not np.isfinite(v):
                raise ValueError(f"row {i} contains a non-finite value")


def predict(historical_data: List[List[float]]) -> np.ndarray:
    if not is_loaded():
        raise RuntimeError("Model is not loaded")
    validate_input(historical_data)
    arr = np.asarray(historical_data, dtype=float)
    scaled = scaler.transform(arr)
    model_input = scaled.reshape(1, 12, 5)
    scaled_pred = model.predict(model_input, verbose=0)
    real = scaler.inverse_transform(scaled_pred)
    return np.asarray(real[0], dtype=float).reshape(5)
