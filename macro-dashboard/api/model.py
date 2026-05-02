import os
import requests
import pandas as pd
from prophet import Prophet
from dotenv import load_dotenv

# Load .env.local specifically
load_dotenv(dotenv_path=".env.local")

FRED_API_KEY = os.getenv("FRED_API_KEY")
if not FRED_API_KEY:
    print("WARNING: FRED_API_KEY not found in environment!")
BASE_URL = "https://api.stlouisfed.org/fred/series/observations"

def get_fred_data(series_id):
    params = {
        "series_id": series_id,
        "api_key": FRED_API_KEY,
        "file_type": "json",
        "observation_start": "2010-01-01", # Go back far enough for seasonality
    }
    response = requests.get(BASE_URL, params=params)
    response.raise_for_status()
    data = response.json()
    
    df = pd.DataFrame(data['observations'])
    df['date'] = pd.to_datetime(df['date'])
    df['value'] = pd.to_numeric(df['value'], errors='coerce')
    df = df.dropna()
    
    # Apply transformations based on series type
    if series_id == "CPIAUCSL":
        # Year-over-Year % Change
        df['value'] = df['value'].pct_change(periods=12) * 100
    elif series_id == "PAYEMS":
        # Monthly net change (thousands)
        df['value'] = df['value'].diff()
        
    df = df.dropna()
    
    # Prophet requires columns 'ds' and 'y'
    return df.rename(columns={'date': 'ds', 'value': 'y'})

def get_prediction(series_id):
    print(f"Starting prediction for {series_id}...")
    import time
    start_time = time.time()
    
    # Fetch data
    df = get_fred_data(series_id)
    
    # Initialize and fit model
    # Yearly seasonality is important for macro data
    model = Prophet(yearly_seasonality=True, interval_width=0.8)
    model.fit(df)
    
    # Create future dataframe (12 months)
    future = model.make_future_dataframe(periods=12, freq='MS')
    
    # Predict
    forecast = model.predict(future)
    
    # Return both historical and forecast
    # We'll return the last few years of historical + the future
    historical_count = min(len(df), 60) # Last 5 years
    result = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(historical_count + 12)
    
    # Merge actuals back in
    result = result.merge(df, on='ds', how='left')
    
    # Convert dates to strings for JSON serialization
    result['ds'] = result['ds'].dt.strftime('%Y-%m-%d')
    
    # Robustly handle NaN values (convert to None/null for JSON)
    # Using a list comprehension to ensure pure Python types
    data = result.to_dict(orient='records')
    for row in data:
        for k, v in row.items():
            if pd.isna(v):
                row[k] = None
                
    # Calculate Accuracy (MAPE) on historical data
    # Compare 'y' (actual) with 'yhat' (prediction) for historical points
    historical_data = result.dropna(subset=['y'])
    if len(historical_data) > 0:
        mape = (abs(historical_data['y'] - historical_data['yhat']) / historical_data['y'].abs()).mean()
        accuracy = max(0, 100 - (mape * 100))
    else:
        accuracy = 0

    print(f"Prediction complete for {series_id} in {time.time() - start_time:.2f}s (Accuracy: {accuracy:.1f}%)")
    return {
        "points": data,
        "accuracy": round(accuracy, 1)
    }
