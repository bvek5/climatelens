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

    df = pd.read_csv("../data/climate_data.csv")

    result = df[
        (df["country"].str.lower() == country_name.lower()) &
        (df["year"] == year)
    ]

    if result.empty:
        return {"error": "No data found"}

    return result.iloc[0].to_dict()