from .forecast_models import arima_predictions, linear_regression, exponential_smothing, \
    holt_winters_predictions, lasso, bayesian_regression, decision_tree, sarimax
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
def best_model(dataframe, test_p, pred_p, models: list):
    df = dataframe.copy()
    df_pred = pd.DataFrame()
    model_data = {}

    for column, row in df.iterrows():
        if 'arima' in models:
            arima_df, arima_mape = arima_predictions.arima_predictions(row, test_p, pred_p)
            model_data['arima'] = {'mape': arima_mape, 'df': arima_df}

        if 'holtsWintersExponentialSmoothing' in models:
            holt_df, holt_mape = holt_winters_predictions.holt_winters_predictions(row, test_p, pred_p)
            model_data['holtsWintersExponentialSmoothing'] = {'mape': holt_mape, 'df': holt_df}

        if 'simpleExponentialSmoothing' in models:
            exp_df, exp_mape = exponential_smothing.exp_smoothing_predictions(row, test_p, pred_p)
            model_data['simpleExponentialSmoothing'] = {'mape': exp_mape, 'df': exp_df}

        if 'linearRegression' in models:
            linear_df, linear_mape = linear_regression.linear_regression_predictions(row, test_p, pred_p)
            model_data['linearRegression'] = {'mape': linear_mape, 'df': linear_df}

        if 'lasso' in models:
            lasso_df, lasso_mape = lasso.lasso_regression_predictions(row, test_p, pred_p)
            model_data['lasso'] = {'mape': lasso_mape, 'df': lasso_df}

        if 'bayesian' in models:
            bayesian_df, bayesian_mape = bayesian_regression.bayesian_regression_predictions(row, test_p, pred_p)
            model_data['bayesian'] = {'mape': bayesian_mape, 'df': bayesian_df}

        if 'decisionTree' in models:
            decision_tree_df, decision_tree_mape = decision_tree.decision_tree_regression_predictions(row, test_p, pred_p)
            model_data['decisionTree'] = {'mape': decision_tree_mape, 'df': decision_tree_df}

        if 'sarimax' in models:
            sarimax_df, sarimax_mape = sarimax.sarimax_predictions(row, test_p, pred_p)
            model_data['sarimax'] = {'mape': sarimax_mape, 'df': sarimax_df}

        best_model_name = min(model_data, key=lambda k: model_data[k]['mape'])
        best_df = model_data[best_model_name]['df']
        best_df['MAPE'] = model_data[best_model_name]['mape']

        df_pred = df_pred._append(best_df, ignore_index=False)

    return df_pred
