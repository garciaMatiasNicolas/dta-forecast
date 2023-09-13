import pandas as pd


# Function for read xlsx file and create sql_table
def save_dataframe(route_file: str):
    dataframe = pd.read_excel(route_file)
