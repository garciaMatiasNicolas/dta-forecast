from .forecast_models import arima_predictions, linear_regression, exponential_smothing, holt_winters_predictions
from database.db_engine import engine
import pandas as pd
import numpy as np
import datetime as dt


# Function to get historical data
def get_historical_data(table_name: str):
    dataframe = pd.read_sql_table(table_name, con=engine)

    dataframe.iloc[:, 13:] = dataframe.iloc[:, 13:].replace(to_replace=["NaN", "null", "nan"], value=np.nan)
    dataframe.iloc[:, 13:] = dataframe.iloc[:, 13:].fillna(0).apply(pd.to_numeric, errors='coerce').values

    columns = dataframe.columns[13:]

    dataframe.rename(
        columns={col: dt.datetime.strptime(col, '%Y-%m-%d %H:%M:%S').strftime('%Y-%m-%d') for col in columns},
        inplace=True)

    dataframe.iloc[:, 13:] = dataframe.iloc[:, 13:].fillna(0)

    return dataframe


# Function to choose best model
def best_model(dataframe, test_p, pred_p):
    df = dataframe.copy()
    df_pred = pd.DataFrame()

    for product, row in df.iterrows():
        arima_df, arima_mape = arima_predictions.arima_predictions(row, test_p, pred_p)
        linear_df, linear_mape = linear_regression.linear_regression_predictions(row, test_p, pred_p)
        exp_df, exp_mape = exponential_smothing.exp_smoothing_predictions(row, test_p, pred_p)
        holt_df, holt_mape = holt_winters_predictions.holt_winters_predictions(row, test_p, pred_p)

        mape_list = [arima_mape, linear_mape, exp_mape, holt_mape]
        best_model_idx = mape_list.index(min(mape_list))

        if best_model_idx == 0:
            best_df = arima_df
            best_df['MAPE'] = arima_mape

        elif best_model_idx == 1:
            best_df = linear_df
            best_df['MAPE'] = linear_mape

        elif best_model_idx == 2:
            best_df = exp_df
            best_df['MAPE'] = exp_mape

        else:
            best_df = holt_df
            best_df['MAPE'] = holt_mape

        df_pred = df_pred._append(best_df, ignore_index=False)

    return df_pred
