"""FastAPI inference service for the Farmyza climate/crop model."""

import logging
import traceback

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator

from crop_rules import recommend
from inference import (
    FEATURE_ORDER,
    get_load_error,
    is_loaded,
    predict,
    validate_input,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ml-service")

app = FastAPI(title="Farmyza ML Inference", version="1.0.0")


class Location(BaseModel):
    lat: float = Field(..., ge=-90.0, le=90.0)
    lon: float = Field(..., ge=-180.0, le=180.0)


class PredictRequest(BaseModel):
    location: Location
    historical_data: list[list[float]]

    @field_validator("historical_data")
    @classmethod
    def _check_shape(cls, v):
        try:
            validate_input(v)
        except ValueError as exc:
            raise ValueError(str(exc)) from exc
        return v


class Forecast(BaseModel):
    t2m_max_predicted: float
    prectotcorr_predicted: float
    rh2m_predicted: float
    gwetroot_predicted: float
    t2m_min_predicted: float


class PredictResponse(BaseModel):
    status: str
    forecast: Forecast
    recommended_crop: str
    adaptation_reason: str


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": is_loaded()}


@app.post("/predict-crop", response_model=PredictResponse)
def predict_crop(payload: PredictRequest):
    if not is_loaded():
        err = get_load_error()
        logger.error("Model not loaded: %s", err)
        raise HTTPException(status_code=503, detail="Model not loaded")
    try:
        values = predict(payload.historical_data)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception:  # noqa: BLE001
        logger.error("Inference failed:\n%s", traceback.format_exc())
        raise HTTPException(status_code=500, detail="Inference failed")
    try:
        crop, reason = recommend(values)
    except Exception:  # noqa: BLE001
        logger.error("Crop rule failed:\n%s", traceback.format_exc())
        raise HTTPException(status_code=500, detail="Crop recommendation failed")
    forecast = Forecast(
        t2m_max_predicted=float(values[0]),
        prectotcorr_predicted=float(values[1]),
        rh2m_predicted=float(values[2]),
        gwetroot_predicted=float(values[3]),
        t2m_min_predicted=float(values[4]),
    )
    return PredictResponse(
        status="success",
        forecast=forecast,
        recommended_crop=crop,
        adaptation_reason=reason,
    )
