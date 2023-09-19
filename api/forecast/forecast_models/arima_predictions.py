from ..mape_cacl import mape_calc
from statsmodels.tsa.arima.model import ARIMA
import pandas as pd
import pmdarima as pm


def arima_predictions(fila, test_periods, prediction_periods):
    df_pred = pd.DataFrame(columns=['family', 'region', 'salesman', 'client', 'category', 'subcategory',
                                    'sku', 'description', 'model', 'date', 'value'])

    df_pred_fc = df_pred.copy()
    time_series = pd.Series(fila.iloc[13:]).astype(dtype='float')
    train_data = time_series[:-test_periods]

    test_data = time_series.iloc[-test_periods:]
    n_train = len(train_data)
# --------------------------------------------------------
    model = pm.auto_arima(train_data)
    arima_order = model.order
    model = ARIMA(train_data, order=arima_order)
    model_fit = model.fit()

    train_predictions = model_fit.predict(start=0, end=n_train - 1)
    test_predictions = model_fit.predict(start=n_train, end=len(time_series) - 1)
# -------------------------------------------------------------
    start_date = pd.to_datetime(test_data.index[-1])
    next_month = start_date + pd.DateOffset(months=1)
    future_dates = pd.date_range(start=next_month, periods=prediction_periods, freq='MS')
    future_dates = future_dates.strftime('%Y-%m-%d')
    future_predictions = model_fit.forecast(prediction_periods)
# -------------------------------------------------------------
    for i, og in enumerate(train_predictions):

        og_date = train_data.index[i]

        df_pred = df_pred._append(
            {'family': fila.iloc[1], 'region': fila.iloc[2], 'salesman': fila.iloc[3], 'client': fila.iloc[4],
             'category': fila.iloc[5], 'subcategory': fila.iloc[6],
             'sku': fila.iloc[7], 'description': fila.iloc[8], 'model': 'actual',
             'date': og_date, 'value': fila[og_date]}, ignore_index=True)

        df_pred = df_pred._append(
            {'family': fila.iloc[1], 'region': fila.iloc[2], 'salesman': fila.iloc[3],
             'client': fila.iloc[4],
             'category': fila.iloc[5], 'subcategory': fila.iloc[6],
             'sku': fila.iloc[7], 'description': fila.iloc[8], 'model': 'arima',
             'date': og_date, 'value': og}, ignore_index=True)

    for i, test in enumerate(test_predictions):

        test_date = test_data.index[i]
        df_pred = df_pred._append(
            {'family': fila.iloc[1], 'region': fila.iloc[2], 'salesman': fila.iloc[3],
             'client': fila.iloc[4],
             'category': fila.iloc[5], 'subcategory': fila.iloc[6],
             'sku': fila.iloc[7], 'description': fila.iloc[8], 'model': 'actual',
             'date': test_date, 'value': fila[test_date]}, ignore_index=True)

        df_pred = df_pred._append(
            {'family': fila.iloc[1], 'region': fila.iloc[2], 'salesman': fila.iloc[3],
             'client': fila.iloc[4],
             'category': fila.iloc[5], 'subcategory': fila.iloc[6],
             'sku': fila.iloc[7], 'description': fila.iloc[8], 'model': 'arima',
             'date': test_date, 'value': test}, ignore_index=True)

    df_pred_pivot = df_pred.pivot(values='value', index=['family', 'region', 'salesman', 'client', 'category',
                                  'subcategory', 'sku', 'description', 'model'], columns='date')

    mape = mape_calc(df_pred_pivot, 'arima')

    for i, future in enumerate(future_dates):

        fut_date = future_dates[i]
        df_pred_fc = df_pred_fc._append(
            {'family': fila.iloc[1], 'region': fila.iloc[2], 'salesman': fila.iloc[3], 'client': fila.iloc[4],
             'category': fila.iloc[5], 'subcategory': fila.iloc[6],
             'sku': fila.iloc[7], 'description': fila.iloc[8], 'model': 'actual',
             'date': fut_date, 'value': None}, ignore_index=True)

        df_pred_fc = df_pred_fc._append(
            {'family': fila.iloc[1], 'region': fila.iloc[2], 'salesman': fila.iloc[3],
             'client': fila.iloc[4],
             'category': fila.iloc[5], 'subcategory': fila.iloc[6],
             'sku': fila.iloc[7], 'description': fila.iloc[8], 'model': 'arima',
             'date': fut_date, 'value': future_predictions[i]}, ignore_index=True)

    df_pred_fc_pivot = df_pred_fc.pivot(values='value', index=['family', 'region', 'salesman', 'client', 'category',
                                        'subcategory', 'sku', 'description', 'model'],
                                        columns='date')

    result = pd.concat([df_pred_pivot, df_pred_fc_pivot], axis=1)

    return result, mape
