import pandas as pd
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {
    "Project": "climatelens",
    "status": "Running"
}
 
@app.get("/country/{country_name}/{year}")
def get_country_data(country_name: str, year: int):

    df = pd.read_csv("../data/owid-co2-data.csv")

    result = df[
        (df["country"].str.lower() == country_name.lower()) &
        (df["year"] == year)
    ]

    if result.empty:
        return {"error": "No data found"}

    row = result.iloc[0].where(pd.notnull(result.iloc[0]), None)
    return {
    "country": row["country"],
    "year": int(row["year"]),
    "iso_code": row["iso_code"],
    "population": row["population"],
    "gdp": row["gdp"],
    "co2": row["co2"],
    "co2_per_capita": row["co2_per_capita"],
    "co2_growth_percent": row["co2_growth_prct"],
    "energy_per_capita": row["energy_per_capita"],
    "primary_energy_consumption": row["primary_energy_consumption"],
    "total_ghg": row["total_ghg"],
    "temperature_change_from_co2": row["temperature_change_from_co2"]
}