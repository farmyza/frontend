# Farmyza ML Inference Service

FastAPI service that loads the BiLSTM weather model (`nasa_bilstm_weather_model.h5`)
and MinMaxScaler (`weather_scaler.pkl`) at startup and exposes `/health` and
`POST /predict-crop`.

## Run

```bash
cd ml-service
python -m pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

Environment variables (all optional, with defaults):

- `ML_SERVICE_HOST` (default `0.0.0.0`)
- `ML_SERVICE_PORT` (default `8000`)
- `MODEL_PATH` (default `../nasa_bilstm_weather_model.h5`)
- `SCALER_PATH` (default `../weather_scaler.pkl`)

Model assets are read from the repository root by default; do not move them.
