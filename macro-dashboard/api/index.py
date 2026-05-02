from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from .model import get_prediction
import uvicorn

app = FastAPI()

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/py/predict")
async def predict(series_id: str = Query(..., alias="series")):
    try:
        forecast_data = get_prediction(series_id)
        return {
            "status": "success",
            "series_id": series_id,
            "data": forecast_data
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/py/health")
async def health():
    return {"status": "ok"}

# This is for local development with uvicorn
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
