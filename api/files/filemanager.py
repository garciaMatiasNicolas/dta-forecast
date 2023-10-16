import pandas as pd
from urllib.parse import urlparse
from rest_framework import status
from rest_framework.response import Response
from database.db_engine import engine


def obtain_file_route(route):
    parsed_url = urlparse(route)
    split_route = parsed_url.path.split('/')
    route_index = split_route.index('media')
    new_route = '/'.join(split_route[route_index:])
    return new_route


def save_dataframe(route_file: str, file_name: str, model_type: str):
    # Create dataframe with the Excel file
    new_route = obtain_file_route(route=route_file)
    dataframe = pd.read_excel(new_route)
    dataframe.astype('str')
    dataframe.fillna(0, inplace=True)
    table_name = file_name

    if model_type == "historical_data":
        dataframe.to_sql(table_name, con=engine, if_exists='replace', index=False)

    else:
        raise ValueError("model_not_allowed")
        return Response({'error': 'bad_request', 'logs': 'model_not_allowed'},
                        status=status.HTTP_400_BAD_REQUEST)
