import pandas as pd
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {
    "Project": "climatelens",
    "status": "Running"
}

@app.get("/countries")
def get_countries():

    df = pd.read_csv("../data/owid-co2-data.csv")

    countries = df["country"].dropna().unique().tolist()
    countries.sort()

    return {
        "count": len(countries),
        "countries": countries
    }


@app.get("/country/{country_name}/latest")
def get_latest_country_data(country_name: str):

    df = pd.read_csv("../data/owid-co2-data.csv")

    result = df[
        df["country"].str.lower() == country_name.lower()
    ]

    if result.empty:
        return {"error": "No data found"}

    result = result.sort_values("year", ascending=False)

    row = result.iloc[0].where(pd.notnull(result.iloc[0]), None)

    return {
        "country": row["country"],
        "latest_year": int(row["year"]),
        "iso_code": row["iso_code"],
        "population": row["population"],
        "gdp": row["gdp"],
        "co2": row["co2"],
        "co2_per_capita": row["co2_per_capita"],
        "total_ghg": row["total_ghg"],
        "primary_energy_consumption": row["primary_energy_consumption"]
    }

@app.get("/country/{country_name}/history")
def get_country_history(country_name: str):

    df = pd.read_csv("../data/owid-co2-data.csv")

    result = df[
        df["country"].str.lower() == country_name.lower()
    ]

    if result.empty:
        return {"error": "No data found"}

    result = result[["year", "co2", "co2_per_capita", "population", "total_ghg"]]

    result = result.astype(object).where(pd.notnull(result), None)

    return result.to_dict(orient="records")
 
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

@app.get("/compare/{country_one}/{country_two}/{year}")
def compare_countries(country_one: str, country_two: str, year: int):

    df = pd.read_csv("../data/owid-co2-data.csv")

    result = df[
        (df["country"].str.lower().isin([country_one.lower(), country_two.lower()])) &
        (df["year"] == year)
    ]

    if result.empty:
        return {"error": "No data found"}

    result = result[[
        "country",
        "year",
        "population",
        "co2",
        "co2_per_capita",
        "total_ghg",
        "primary_energy_consumption"
    ]]

    result = result.astype(object).where(pd.notnull(result), None)

    return result.to_dict(orient="records")