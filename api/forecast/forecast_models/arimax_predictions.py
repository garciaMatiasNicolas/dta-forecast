from ..Error import error_calc
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA


def arimax_predictions(row, train_data, test_data, prediction_periods, seasonal_periods, exog_data=None, order=(1, 0, 1)):
    df_pred = pd.DataFrame(columns=['family', 'region', 'salesman', 'client', 'category', 'subcategory',
                                    'sku', 'description', 'model', 'date', 'value'])

    df_pred_fc = df_pred.copy()

    model = ARIMA(train_data, exog=exog_data, order=order)
    model_fit = model.fit()

    train_predictions = model_fit.predict(start=0, end=len(train_data) - 1, exog=exog_data)
    test_predictions = model_fit.forecast(steps=len(test_data), exog=exog_data)
    future_predictions = model_fit.forecast(steps=prediction_periods, exog=exog_data)

    for i, og in enumerate(train_predictions):
        og_date = train_data.index[i]
        df_pred = df_pred.append({
            'family': 'Example', 'region': 'Example', 'salesman': 'Example', 'client': 'Example',
            'category': 'Example', 'subcategory': 'Example', 'sku': 'Example', 'description': 'Example',
            'model': 'actual', 'date': og_date, 'value': train_data[og_date]
        }, ignore_index=True)

        df_pred = df_pred.append({
            'family': 'Example', 'region': 'Example', 'salesman': 'Example', 'client': 'Example',
            'category': 'Example', 'subcategory': 'Example', 'sku': 'Example', 'description': 'Example',
            'model': 'arimax', 'date': og_date, 'value': (0 if og < 0 else og)
        }, ignore_index=True)

    for i, test in enumerate(test_predictions):
        test_date = test_data.index[i]
        df_pred = df_pred.append({
            'family': 'Example', 'region': 'Example', 'salesman': 'Example', 'client': 'Example',
            'category': 'Example', 'subcategory': 'Example', 'sku': 'Example', 'description': 'Example',
            'model': 'actual', 'date': test_date, 'value': test_data[test_date]
        }, ignore_index=True)

        df_pred = df_pred.append({
            'family': 'Example', 'region': 'Example', 'salesman': 'Example', 'client': 'Example',
            'category': 'Example', 'subcategory': 'Example', 'sku': 'Example', 'description': 'Example',
            'model': 'arimax', 'date': test_date, 'value': test
        }, ignore_index=True)

    future_dates = pd.date_range(start=test_data.index[-1], periods=prediction_periods + len(test_data), freq='MS')
    future_dates = future_dates[len(test_data):].strftime('%Y-%m-%d')

    for i, future in enumerate(future_predictions):
        fut_date = future_dates[i]
        df_pred_fc = df_pred_fc.append({
            'family': 'Example', 'region': 'Example', 'salesman': 'Example', 'client': 'Example',
            'category': 'Example', 'subcategory': 'Example', 'sku': 'Example', 'description': 'Example',
            'model': 'actual', 'date': fut_date, 'value': None
        }, ignore_index=True)

        df_pred_fc = df_pred_fc.append({
            'family': 'Example', 'region': 'Example', 'salesman': 'Example', 'client': 'Example',
            'category': 'Example', 'subcategory': 'Example', 'sku': 'Example', 'description': 'Example',
            'model': 'arimax', 'date': fut_date, 'value': (0 if future_predictions[i] < 0 else future_predictions[i])
        }, ignore_index=True)

    df_pred_pivot = df_pred.pivot_table(values='value', index=['family', 'region', 'salesman', 'client', 'category',
                                                               'subcategory', 'sku', 'description', 'model'],
                                        columns='date')

    df_pred_fc_pivot = df_pred_fc.pivot_table(values='value', index=['family', 'region', 'salesman', 'client', 'category',
                                                                     'subcategory', 'sku', 'description', 'model'],
                                              columns='date')

    result = pd.concat([df_pred_pivot, df_pred_fc_pivot], axis=1)
    mape = error_calc(df_pred_pivot, 'arimax', )

    return result, mape
