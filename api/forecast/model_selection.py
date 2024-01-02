from .forecast_models import arima_predictions, linear_regression, exponential_smothing, \
    holt_winters_holt_EMA, lasso, bayesian_regression, decision_tree, prophet, sarimax_predictions, arimax_predictions
from database.db_engine import engine
import pandas as pd
import numpy as np
import datetime as dt
from sqlalchemy.exc import NoSuchTableError


# Function to get historical data
def get_historical_data(table_name: str):
    try:
        dataframe = pd.read_sql_table(table_name, con=engine)

        dataframe.iloc[:, 13:] = dataframe.iloc[:, 13:].replace(to_replace=["NaN", "null", "nan"], value=np.nan)
        dataframe.iloc[:, 13:] = dataframe.iloc[:, 13:].fillna(0).apply(pd.to_numeric, errors='coerce').values

        columns = dataframe.columns[13:]

        dataframe.iloc[:, 13:] = dataframe.iloc[:, 13:].fillna(0)

        return dataframe

    except NoSuchTableError as e:
        return None


# Function to choose best model
def best_model(df_historical: pd.DataFrame, test_p, pred_p, models: list, seasonal_periods,
               additional_params: dict, error_method: str, scenario_name: str, exog_dataframe=None,
               exog_projected_df=None):

    df_historical = df_historical.copy()

    df_pred = pd.DataFrame()
    df_all_models = pd.DataFrame()

    model_data = {}

    if exog_dataframe is None:
        for column, row in df_historical.iterrows():
            if 'arima' in models:
                arima_df, arima_mape = arima_predictions.arima_sarima_arimax_sarimax_predictions(row=row,
                                                                                                 test_periods=test_p,
                                                                                                 prediction_periods=pred_p,
                                                                                                 seasonal_periods=seasonal_periods,
                                                                                                 model_name='arima',
                                                                                                 additional_params=additional_params,
                                                                                                 error_method=error_method)

                model_data['arima'] = {error_method: arima_mape, 'df': arima_df}

                arima_df = arima_df.assign(MAPE=lambda x: arima_mape)
                df_all_models = df_all_models._append(arima_df, ignore_index=False)

            if 'holtsWintersExponentialSmoothing' in models:

                try:
                    holt_wint_df, holt_wint_mape = holt_winters_holt_EMA.holts_winters_holts_ema(row=row,
                                                                                                 test_periods=test_p,
                                                                                                 prediction_periods=pred_p,
                                                                                                 additional_params=additional_params,
                                                                                                 model_name='holt_winters',
                                                                                                 seasonal_periods=seasonal_periods,
                                                                                                 error_method=error_method)

                    model_data['holtsWintersExponentialSmoothing'] = {error_method: holt_wint_mape, 'df': holt_wint_df}

                    holt_wint_df = holt_wint_df.assign(MAPE=lambda x: holt_wint_mape)
                    df_all_models = df_all_models._append(holt_wint_df, ignore_index=False)

                except ValueError as err:
                    if str(err) == ('''Cannot compute initial seasonals using heuristic method with 
                    less than two full seasonal cycles in the data.'''):
                        return err

            if 'holtsExponentialSmoothing' in models:

                holt_df, holt_mape = holt_winters_holt_EMA.holts_winters_holts_ema(row=row,
                                                                                   test_periods=test_p,
                                                                                   prediction_periods=pred_p,
                                                                                   additional_params=additional_params,
                                                                                   model_name='holt',
                                                                                   seasonal_periods=seasonal_periods,
                                                                                   error_method=error_method)

                model_data['holtsExponentialSmoothing'] = {error_method: holt_mape, 'df': holt_df}

                holt_df = holt_df.assign(MAPE=lambda x: holt_mape)
                df_all_models = df_all_models._append(holt_df, ignore_index=False)

            if 'exponential_moving_average' in models:
                ema_df, ema_mape = holt_winters_holt_EMA.holts_winters_holts_ema(row=row, test_periods=test_p,
                                                                                 prediction_periods=pred_p,
                                                                                 model_name='exponential_moving_average',
                                                                                 seasonal_periods=seasonal_periods,
                                                                                 error_method=error_method)

                model_data['exponential_moving_average'] = {error_method: ema_mape, 'df': ema_df}
                ema_df = ema_df.assign(MAPE=lambda x: ema_mape)
                df_all_models = df_all_models._append(ema_df, ignore_index=False)

            if 'simpleExponentialSmoothing' in models:
                exp_df, exp_mape = exponential_smothing.exp_smoothing_predictions(row, test_p, pred_p, seasonal_periods,
                                                                                  error_method=error_method)

                model_data['simpleExponentialSmoothing'] = {error_method: exp_mape, 'df': exp_df}
                exp_df = exp_df.assign(MAPE=lambda x: exp_mape)
                df_all_models = df_all_models._append(exp_df, ignore_index=False)

            if 'prophet' in models:
                prophet_df, prophet_mape = prophet.prophet_predictions(row=row, test_periods=test_p,
                                                                       prediction_periods=pred_p,
                                                                       seasonal_periods=seasonal_periods,
                                                                       additional_params=additional_params,
                                                                       error_method=error_method)

                model_data['prophet'] = {error_method: prophet_mape, 'df': prophet_df}
                prophet_df = prophet_df.assign(MAPE=lambda x: prophet_mape)
                df_all_models = df_all_models._append(prophet_df, ignore_index=False)

            if 'linearRegression' in models:
                linear_df, linear_mape = linear_regression.linear_regression_predictions(fila=row, test_periods=test_p,
                                                                                         prediction_periods=pred_p,
                                                                                         seasonal_periods=seasonal_periods,
                                                                                         error_method=error_method)

                model_data['linearRegression'] = {error_method: linear_mape, 'df': linear_df}
                linear_df = linear_df.assign(MAPE=lambda x: linear_mape)
                df_all_models = df_all_models._append(linear_df, ignore_index=False)

            if 'lasso' in models:
                lasso_df, lasso_mape = lasso.lasso_regression_predictions(row, test_p, pred_p, seasonal_periods,
                                                                          error_method=error_method)

                model_data['lasso'] = {error_method: lasso_mape, 'df': lasso_df}

                lasso_df = lasso_df.assign(MAPE=lambda x: lasso_mape)
                df_all_models = df_all_models._append(lasso_df, ignore_index=False)

            if 'bayesian' in models:
                bayesian_df, bayesian_mape = bayesian_regression.bayesian_regression_predictions(row, test_p, pred_p,
                                                                                                 error_method=error_method)
                model_data['bayesian'] = {error_method: bayesian_mape, 'df': bayesian_df}

                bayesian_df = bayesian_df.assign(MAPE=lambda x: bayesian_mape)
                df_all_models = df_all_models._append(bayesian_df, ignore_index=False)

            if 'decisionTree' in models:
                decision_tree_df, decision_tree_mape = decision_tree.decision_tree_regression_predictions(row, test_p,
                                                                                                          pred_p,
                                                                                                          seasonal_periods,
                                                                                                          error_method=error_method)

                model_data['decisionTree'] = {error_method: decision_tree_mape, 'df': decision_tree_df}
                decision_tree_df = decision_tree_df.assign(MAPE=lambda x: decision_tree_mape)
                df_all_models = df_all_models._append(decision_tree_df, ignore_index=False)

            if 'sarima' in models:

                sarima_df, sarima_mape = arima_predictions.arima_sarima_arimax_sarimax_predictions(row=row,
                                                                                                   test_periods=test_p,
                                                                                                   prediction_periods=pred_p,
                                                                                                   seasonal_periods=seasonal_periods,
                                                                                                   model_name='sarima',
                                                                                                   additional_params=additional_params,
                                                                                                   error_method=error_method)

                model_data['sarima'] = {error_method: sarima_mape, 'df': sarima_df}

                sarima_df = sarima_df.assign(MAPE=lambda x: sarima_mape)
                df_all_models = df_all_models._append(sarima_df, ignore_index=False)

            best_model_name = min(model_data, key=lambda k: model_data[k][error_method])
            best_df = model_data[best_model_name]['df']
            best_df[error_method] = model_data[best_model_name][error_method]
            df_pred = df_pred._append(best_df, ignore_index=False)

    # Models with exog variables
    else:
        df_exog = exog_dataframe.copy()
        for column, row_historical in df_historical.iterrows():

            for column_exog, row_exog in df_exog.iterrows():

                if row_exog['Family'] == 'all_data':
                    row_exog_data = row_exog
                    break

                elif (
                        (row_exog['Family'] == row_historical['Family']) or
                        (row_exog['Region'] == row_historical['Region']) or
                        (row_exog['Category'] == row_historical['Category']) or
                        (row_exog['Subcategory'] == row_historical['Subcategory']) or
                        (row_exog['Client'] == row_historical['Client']) or
                        (row_exog['Salesman'] == row_historical['Salesman'])
                ):
                    row_exog_data = row_exog
                    break

                else:
                    row_exog_data = None

            if 'sarimax' in models:
                sarimax_df, sarimax_mape = sarimax_predictions.sarimax_predictions(
                    row=row_historical, prediction_periods=pred_p, test_periods=test_p,
                    seasonal_periods=seasonal_periods,
                    row_exog_data=row_exog_data, error_method=error_method,
                    additional_params=additional_params, row_exog_projected=exog_projected_df)

                model_data['sarimax'] = {error_method: sarimax_mape, 'df': sarimax_df}

                sarimax_df = sarimax_df.assign(MAPE=lambda x: sarimax_mape)
                df_all_models = df_all_models._append(sarimax_df, ignore_index=False)

            if 'arimax' in models:
                arimax_df, arimax_error = arimax_predictions.arimax_predictions(
                    row=row_historical, prediction_periods=pred_p, test_periods=test_p,
                    seasonal_periods=seasonal_periods,
                    row_exog_data=row_exog_data, model_name='sarimax', error_method=error_method,
                    additional_params=additional_params, row_exog_projected=exog_projected_df)

                model_data['arimax'] = {error_method: arimax_error, 'df': arimax_df}

                arimax_df = arimax_df.assign(MAPE=lambda x: arimax_error)
                df_all_models = df_all_models._append(arimax_df, ignore_index=False)

            best_model_name = min(model_data, key=lambda k: model_data[k][error_method])
            best_df = model_data[best_model_name]['df']
            best_df[error_method] = model_data[best_model_name][error_method]
            df_pred = df_pred._append(best_df, ignore_index=False)

    df_all_models.to_excel(f'data_scenario_{scenario_name}.xlsx')
    return df_pred
