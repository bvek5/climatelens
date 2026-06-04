from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {
    "Project": "climatelens",
    "status": "Running"
}
 
@app.get("/country/{country_name}")
def get_country_data(country_name: str):

    climate_data = {
        "Nepal": {
            "year": 2020,
            "co2_emissions": "16.9 Mt",
            "renewable_energy": "85%"
        },

        "Canada": {
            "year": 2020,
            "co2_emissions": "672 Mt",
            "renewable_energy": "18%"
        },

        "India": {
            "year": 2020,
            "co2_emissions": "2441 Mt",
            "renewable_energy": "11%"
        }
    }

    return climate_data.get(
        country_name,
        {"error": "Country not found"}
    )