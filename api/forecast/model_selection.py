from .forecast_models import arima_predictions, linear_regression, exponential_smothing, \
    holt_winters_holt_EMA, lasso, bayesian_regression, decision_tree, prophet
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
def best_model(df_historical: pd.DataFrame, test_p, pred_p, models: list, seasonal_periods,
               additional_params: dict, error_method: str, exog_dataframe=None):

    df_historical = df_historical.copy()

    if exog_dataframe is not None:
        df_exog = exog_dataframe.copy()

    df_pred = pd.DataFrame()
    model_data = {}

    for column, row in df_historical.iterrows():
        if 'arima' in models:
            if 'arima_params' not in additional_params:
                additional_params = None

            arima_df, arima_mape = arima_predictions.arima_sarima_arimax_sarimax_predictions(row=row,
            test_periods=test_p, prediction_periods=pred_p, seasonal_periods=seasonal_periods, model_name='arima',
            additional_params=additional_params, error_method=error_method)

            model_data['arima'] = {error_method: arima_mape, 'df': arima_df}

        if 'holtsWintersExponentialSmoothing' in models:
            if 'holts_params' not in additional_params:
                additional_params = None

            holt_wint_df, holt_wint_mape = holt_winters_holt_EMA.holts_winters_holts_ema(row=row,
            test_periods=test_p, prediction_periods=pred_p, additional_params=additional_params,
            model_name='holt_winters', seasonal_periods=seasonal_periods, error_method=error_method)

            model_data['holtsWintersExponentialSmoothing'] = {error_method: holt_wint_mape, 'df': holt_wint_df}

        if 'holtsExponentialSmoothing' in models:
            if 'holts_params' not in additional_params:
                additional_params = None

            holt_df, holt_mape = holt_winters_holt_EMA.holts_winters_holts_ema(row=row,
            test_periods=test_p, prediction_periods=pred_p, additional_params=additional_params,
            model_name='holt', seasonal_periods=seasonal_periods, error_method=error_method)

            model_data['holtsExponentialSmoothing'] = {error_method: holt_mape, 'df': holt_df}

        if 'exponential_moving_average' in models:
            ema_df, ema_mape = holt_winters_holt_EMA.holts_winters_holts_ema(row=row, test_periods=test_p,
            prediction_periods=pred_p, model_name='exponential_moving_average', seasonal_periods=seasonal_periods,
            error_method=error_method)

            model_data['exponential_moving_average'] = {error_method: ema_mape, 'df': ema_df}

        if 'simpleExponentialSmoothing' in models:
            exp_df, exp_mape = exponential_smothing.exp_smoothing_predictions(row, test_p, pred_p, seasonal_periods,
            error_method=error_method)

            model_data['simpleExponentialSmoothing'] = {error_method: exp_mape, 'df': exp_df}

        if 'prophet' in models:
            if 'prophet_params' not in additional_params:
                additional_params = None

            prophet_df, prophet_mape = prophet.prophet_predictions(row=row, test_periods=test_p,
            prediction_periods=pred_p, seasonal_periods=seasonal_periods, additional_params=additional_params,
            error_method=error_method)

            model_data['prophet'] = {error_method: prophet_mape, 'df': prophet_df}

        if 'linearRegression' in models:
            linear_df, linear_mape = linear_regression.linear_regression_predictions(fila=row, test_periods=test_p,
            prediction_periods=pred_p, seasonal_periods=seasonal_periods, error_method=error_method)

            model_data['linearRegression'] = {error_method: linear_mape, 'df': linear_df}

        if 'lasso' in models:
            lasso_df, lasso_mape = lasso.lasso_regression_predictions(row, test_p, pred_p, seasonal_periods,
            error_method=error_method)

            model_data['lasso'] = {error_method: lasso_mape, 'df': lasso_df}

        if 'bayesian' in models:
            bayesian_df, bayesian_mape = bayesian_regression.bayesian_regression_predictions(row, test_p, pred_p,
            error_method=error_method)
            model_data['bayesian'] = {error_method: bayesian_mape, 'df': bayesian_df}

        if 'decisionTree' in models:
            decision_tree_df, decision_tree_mape = decision_tree.decision_tree_regression_predictions(row, test_p,
                                                                                                      pred_p,
                                                                                                      seasonal_periods,
                                                                                                      error_method=error_method)
            model_data['decisionTree'] = {error_method: decision_tree_mape, 'df': decision_tree_df}

        if 'sarima' in models:
            if 'sarima_params' not in additional_params:
                additional_params = None

            sarima_df, sarima_mape = arima_predictions.arima_sarima_arimax_sarimax_predictions(row=row,
            test_periods=test_p, prediction_periods=pred_p, seasonal_periods=seasonal_periods, model_name='sarima',
            additional_params=additional_params, error_method=error_method)

            model_data['sarima'] = {error_method: sarima_mape, 'df': sarima_df}

        best_model_name = min(model_data, key=lambda k: model_data[k][error_method])
        best_df = model_data[best_model_name]['df']
        best_df[error_method] = model_data[best_model_name][error_method]
        df_pred = df_pred._append(best_df, ignore_index=False)

    # Models with exog variables
    if exog_dataframe is not None:
        for (column_historical, row_historical), (column_exog, row_exog) in zip(df_historical.iterrows(),
                                                                                df_exog.iterrows()):
            if 'sarimax' in models:
                sarimax_df, sarimax_mape = arima_predictions.arima_sarima_arimax_sarimax_predictions(row_hsd=row_historical,
                prediction_periods=pred_p, test_periods=test_p, seasonal_periods=seasonal_periods,
                row_exog_data=row_exog, model_name='sarimax', error_method=error_method, additional_params=additional_params)
                model_data['sarimax'] = {'mape': sarimax_mape, 'df': sarimax_df}

            best_model_name = min(model_data, key=lambda k: model_data[k][error_method])
            best_df = model_data[best_model_name]['df']
            best_df[error_method] = model_data[best_model_name][error_method]
            df_pred = df_pred._append(best_df, ignore_index=False)

    return df_pred

