import pandas as pd
from urllib.parse import urlparse
from database.db_engine import engine
import datetime
import pandas as pd


def obtain_file_route(route):
    parsed_url = urlparse(route)
    split_route = parsed_url.path.split('/')
    route_index = split_route.index('media')
    new_route = '/'.join(split_route[route_index:])
    return new_route


def save_dataframe(route_file: str, file_name: str, model_type: str, wasSaved: bool) -> str:
    # Create dataframe with the Excel file
    if not wasSaved:
        new_route = obtain_file_route(route=route_file)
        print(new_route)
        dataframe = pd.read_excel(new_route)
        date_columns = dataframe.iloc[:, 12:].columns
        not_date_columns = dataframe.iloc[:, :12].columns

        for col in not_date_columns:
            dataframe[col] = dataframe[col].astype(str)

        for date in date_columns:
            if isinstance(date, datetime.datetime):
                dataframe[date] = dataframe[date].astype(float)
            else:
                raise ValueError("columns_not_in_date_type")

        dataframe.astype('str')
        dataframe.fillna(0, inplace=True)
        table_name = file_name
        models_allowed = ["historical_data", "historical_exogenous_variables"]

        if model_type not in models_allowed:
            raise ValueError("model_not_allowed")

        else:
            dataframe.to_sql(table_name, con=engine, if_exists='replace', index=False)
            return "succeed"

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


