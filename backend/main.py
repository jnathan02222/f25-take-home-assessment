from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn

# For Weatherstack API
import httpx
from dotenv import load_dotenv
import os
load_dotenv()
WEATHERSTACK_API_KEY = os.getenv('WEATHERSTACK_API_KEY')

# To generate random ids
import random
import string

def get_random_id(length: int = 12):
    alphabet = string.ascii_letters + string.digits
    return ''.join(random.choices(alphabet, k=length))

app = FastAPI(title="Weather Data System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for weather data
weather_storage: Dict[str, Dict[str, Any]] = {}

class WeatherRequest(BaseModel):
    date: str
    location: str
    notes: Optional[str] = ""

class WeatherResponse(BaseModel):
    id: str

@app.post("/weather", response_model=WeatherResponse)
async def create_weather_request(request: WeatherRequest):
    """
    You need to implement this endpoint to handle the following:
    1. Receive form data (date, location, notes)
    2. Calls WeatherStack API for the location
    3. Stores combined data with unique ID in memory
    4. Returns the ID to frontend
    """

    # I saw the requests library in the requirements.txt, but an async library is best practice
    # We don't want to be blocked by this request
    async with httpx.AsyncClient() as client:
        # It's not possible to get weather data by date, since I'm on free-tier
        # Otherwise I would use the endpoint below:
        # f"http://api.weatherstack.com/historical?access_key={WEATHERSTACK_API_KEY}&query={request.location}&historical_date={request.date}
        response = await client.get(f"http://api.weatherstack.com/current?access_key={WEATHERSTACK_API_KEY}&query={request.location}")
    
    # In production we're probably not going to use memory storage, so I'm going to ignore possible race-conditions that may come with accessing the same dictionary across requests
    new_id = get_random_id()
    while new_id in weather_storage:
        new_id = get_random_id()
    weather_storage[new_id] = response.json()

    return {"id": new_id}

@app.get("/weather/{weather_id}")
async def get_weather_data(weather_id: str):
    """
    Retrieve stored weather data by ID.
    This endpoint is already implemented for the assessment.
    """
    if weather_id not in weather_storage:
        raise HTTPException(status_code=404, detail="Weather data not found")

    return weather_storage[weather_id]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)