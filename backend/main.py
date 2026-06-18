import pandas as pd
from fastapi import FastAPI
from app.services.data_service import load_climate_data, clean_missing_values
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
    "Project": "climatelens",
    "status": "Running"
}

@app.get("/countries")
def get_countries():

    df = load_climate_data()

    df = df[df["iso_code"].notna()]
    df = df[df["iso_code"].str.len() == 3]

    excluded = [
        "World",
        "Asia",
        "Africa",
        "Europe",
        "North America",
        "South America",
        "Oceania",
        "European Union",
        "High-income countries",
        "Low-income countries",
        "Lower-middle-income countries",
        "Upper-middle-income countries",
        "Least developed countries (Jones et al.)",
        "OECD (Jones et al.)",
    ]

    countries = df[~df["country"].isin(excluded)]["country"].dropna().unique().tolist()
    countries.sort()

    return {
        "count": len(countries),
        "countries": countries
    }


@app.get("/country/{country_name}/latest")
def get_latest_country_data(country_name: str):

    df = load_climate_data()

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

    df = load_climate_data()

    result = df[
        df["country"].str.lower() == country_name.lower()
    ]

    if result.empty:
        return {"error": "No data found"}

    result = result[["year", "co2", "co2_per_capita", "population", "total_ghg"]]

    result = clean_missing_values(result)

    return result.to_dict(orient="records")
 
@app.get("/country/{country_name}/{year}")
def get_country_data(country_name: str, year: int):

    df = load_climate_data()

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

    df = load_climate_data()

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

    result = clean_missing_values(result)

    return result.to_dict(orient="records")

@app.get("/compare-history/{country_one}/{country_two}")
def compare_country_history(country_one: str, country_two: str):

    df = load_climate_data()

    result = df[
        df["country"].str.lower().isin([country_one.lower(), country_two.lower()])
    ]

    if result.empty:
        return {"error": "No data found"}

    result = result[["country", "year", "co2", "co2_per_capita", "population", "total_ghg", "primary_energy_consumption"]]

    result = clean_missing_values(result)

    return result.to_dict(orient="records")

@app.get("/sustainability/{country_name}")
def get_sustainability_index(country_name: str):

    df = load_climate_data()

    df["gdp_per_capita"] = df["gdp"] / df["population"]

    required_columns = [
        "co2_per_capita",
        "ghg_per_capita",
        "energy_per_gdp",
        "gdp_per_capita"
    ]

    clean_df = df.dropna(subset=required_columns).copy()

    country_data = clean_df[
        clean_df["country"].str.lower() == country_name.lower()
    ]

    if country_data.empty:
        return {"error": "Not enough data to calculate sustainability index"}

    latest_data = clean_df[clean_df["year"] == clean_df["year"].max()]

    row = country_data.sort_values("year", ascending=False).iloc[0]

    def lower_is_better(value, max_value):
        return 100 - ((value / max_value) * 100)

    def higher_is_better(value, max_value):
        return (value / max_value) * 100

    climate_raw = (row["co2_per_capita"] + row["ghg_per_capita"]) / 2

    clean_df["climate_raw"] = (
        clean_df["co2_per_capita"] + clean_df["ghg_per_capita"]
    ) / 2

    climate_score = lower_is_better(
        climate_raw,
        clean_df["climate_raw"].max()
    )

    energy_score = lower_is_better(
        row["energy_per_gdp"],
        clean_df["energy_per_gdp"].max()
    )

    prosperity_score = higher_is_better(
        row["gdp_per_capita"],
        clean_df["gdp_per_capita"].max()
    )

    sustainability_index = (
        climate_score * 0.40
        + energy_score * 0.30
        + prosperity_score * 0.30
    )

    return {
        "country": row["country"],
        "year": int(row["year"]),
        "sustainability_index": round(sustainability_index, 2),
        "climate_score": round(climate_score, 2),
        "energy_score": round(energy_score, 2),
        "prosperity_score": round(prosperity_score, 2),
        "gdp_per_capita": round(row["gdp_per_capita"], 2)
    }