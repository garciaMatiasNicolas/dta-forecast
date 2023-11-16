from prophet import Prophet
import pandas as pd
import numpy as np
from ..mape_cacl import mape_calc


def prophet_forecast(fila, test_periods, prediction_periods):
    df_pred = pd.DataFrame(columns=['family', 'region', 'salesman', 'client', 'category', 'subcategory',
                                    'sku', 'description', 'model', 'date', 'value'])

    df_pred_fc = df_pred.copy()
    time_series = pd.Series(fila.iloc[12:]).astype(dtype='float')
    train_data = time_series[:-test_periods]
    test_data = time_series.iloc[-test_periods:]

    df_prophet = pd.DataFrame({'ds': train_data.index, 'y': train_data.values})

    model = Prophet()
    model.fit(df_prophet)

    future_dates = model.make_future_dataframe(periods=prediction_periods, freq='MS')
    future_dates = future_dates['ds'].dt.strftime('%Y-%m-%d')

    forecast = model.predict(future_dates)

    test_predictions = forecast[-test_periods:]['yhat'].values
    train_predictions = model.predict(df_prophet)['yhat'].values

    df_pred['date'] = pd.concat([train_data.index, test_data.index])
    df_pred['value'] = pd.concat([train_data, pd.Series(test_predictions)])

    df_pred_pivot = df_pred.pivot_table(values='value', index=['family', 'region', 'salesman', 'client', 'category',
                                                               'subcategory', 'sku', 'description', 'model'],
                                        columns='date')

    mape = mape_calc(df_pred_pivot, 'prophet')

    future_pred_dates = pd.to_datetime(future_dates[-prediction_periods:])
    df_pred_fc['date'] = future_pred_dates
    df_pred_fc['value'] = forecast[-prediction_periods:]['yhat'].values

    df_pred_fc_pivot = df_pred_fc.pivot_table(values='value', index=['family', 'region', 'salesman', 'client', 'category',
                                                                     'subcategory', 'sku', 'description', 'model'],
                                              columns='date')

    result = pd.concat([df_pred_pivot, df_pred_fc_pivot], axis=1)

    return result, mape

