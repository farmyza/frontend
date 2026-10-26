# ML Inference Contract

This document is the contract the Next.js backend (BACKEND agent) implements
against. The Python service runs as a separate process and is proxied by
Next.js as `POST /api/v1/predict-crop`.

## Base URL
- Local: `http://127.0.0.1:8000` (configurable via `ML_SERVICE_HOST`/`ML_SERVICE_PORT`).

## Feature order (sacred)
`[T2M_MAX, PRECTOTCORR, RH2M, GWETROOT, T2M_MIN]`

## Endpoints

### GET /health
Response `200`:
```json
{ "status": "ok", "model_loaded": true }
```

### POST /predict-crop
Request body:
```json
{
  "location": { "lat": 21.5, "lon": 88.125 },
  "historical_data": [
    [32.5, 2.1, 65.0, 0.45, 18.2]
    // exactly 12 arrays of 5 numbers
  ]
}
```

Validation: `historical_data` must be exactly 12 arrays of 5 finite numbers.
Invalid shape returns `422`.

Success response `200`:
```json
{
  "status": "success",
  "forecast": {
    "t2m_max_predicted": 33.1,
    "prectotcorr_predicted": 1.5,
    "rh2m_predicted": 58.2,
    "gwetroot_predicted": 0.38,
    "t2m_min_predicted": 19.5
  },
  "recommended_crop": "Millet",
  "adaptation_reason": "..."
}
```

Error responses:
- `422` invalid input shape / non-finite values.
- `503` model not loaded.
- `500` inference or crop-rule failure (generic message; full traceback server-side only).

## Inference pipeline
1. Validate shape `(12, 5)`.
2. `scaled = scaler.transform(data)` (MinMaxScaler).
3. `model_input = scaled.reshape(1, 12, 5)`.
4. `scaled_pred = model.predict(model_input)`.
5. `real = scaler.inverse_transform(scaled_pred)` -> 5 values.
6. Apply rule-based crop recommendation on predicted climate.

## Environment variables
- `ML_SERVICE_HOST` (default `0.0.0.0`)
- `ML_SERVICE_PORT` (default `8000`)
- `MODEL_PATH` (default `../nasa_bilstm_weather_model.h5`)
- `SCALER_PATH` (default `../weather_scaler.pkl`)
