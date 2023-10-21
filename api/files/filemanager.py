import pandas as pd
import numpy as np
import os
from urllib.parse import urlparse
from rest_framework import status
from rest_framework.response import Response
from database.db_engine import engine
import datetime


def obtain_file_route(route):
    parsed_url = urlparse(route)
    split_route = parsed_url.path.split('/')
    route_index = split_route.index('media')
    new_route = '/'.join(split_route[route_index:])
    return new_route


def save_dataframe(route_file: str, file_name: str, model_type: str, wasSaved: bool) -> str:
    # Create dataframe with the Excel file

    if wasSaved == False:
        new_route = obtain_file_route(route=route_file)
        dataframe = pd.read_excel(new_route)
        date_columns = dataframe.columns[12:]

        for column in date_columns:
            if isinstance(column, datetime.datetime):
                print(f"La columna {column} es de tipo datetime")
            else:
                raise ValueError("columns_not_in_date_type")

        dataframe.astype('str')
        dataframe.fillna(0, inplace=True)
        table_name = file_name

        if model_type == "historical_data":
            dataframe.to_sql(table_name, con=engine, if_exists='replace', index=False)
            return "succeed"

        else:
            raise ValueError("model_not_allowed")
        
    else:
        new_route = obtain_file_route(route=route_file)
        dataframe = pd.read_excel(new_route)
        date_columns = dataframe.columns[12:]
        dataframe.astype('str')
        dataframe.fillna(0, inplace=True)
        table_name = file_name
        if model_type == "historical_data":
            dataframe.to_sql(table_name, con=engine, if_exists='replace', index=False)
            return "succeed"