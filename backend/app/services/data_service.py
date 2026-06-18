import pandas as pd

DATA_PATH = "../data/owid-co2-data.csv"

def load_climate_data():
    return pd.read_csv(DATA_PATH)

def clean_missing_values(dataframe):
    return dataframe.astype(object).where(pd.notnull(dataframe), None)