from ..mape_cacl import mape_calc
import pandas as pd


def exp_smoothing_predictions(fila, test_periods, prediction_periods):
    df_pred = pd.DataFrame(columns=['family', 'region', 'salesman', 'client', 'category', 'subcategory',
                                    'sku', 'description', 'model', 'date', 'value'])

    df_pred_fc = df_pred.copy()
    time_series = pd.Series(fila.iloc[13:]).astype(dtype='float')
    train_data = time_series[:-test_periods]
    test_data = time_series.iloc[-test_periods:]

    # Use Pandas' exponential smoothing function to create the model and make predictions
    model = pd.Series(train_data).ewm(span=10).mean()
    test_predictions = model[-test_periods:]
    train_predictions = model[:-test_periods]
    model = model.fillna(0)  # Replace not valid values for zeros

    # ------------------------------------------------------------------------------------
    start_date = pd.to_datetime(test_data.index[-1])
    next_month = start_date + pd.DateOffset(months=1)
    future_dates = pd.date_range(start=next_month, periods=prediction_periods, freq='MS')
    future_dates = future_dates.strftime('%Y-%m-%d')

    future_predictions = model.ewm(span=10, min_periods=0).mean().iloc[-1:].repeat(len(future_dates))
    # -------------------------------------------------------
    for i, og in enumerate(train_predictions):
        og_date = train_data.index[i]

        df_pred = df_pred._append(
            {'family': fila.iloc[0], 'region': fila.iloc[1], 'salesman': fila.iloc[2],
             'client': fila.iloc[3],
             'category': fila.iloc[4], 'subcategory': fila.iloc[5],
             'sku': fila.iloc[6], 'description': fila.iloc[7], 'model': 'actual',
             'date': og_date, 'value': fila[og_date]}, ignore_index=True)

        df_pred = df_pred._append(
            {'family': fila.iloc[0], 'region': fila.iloc[1], 'salesman': fila.iloc[2],
             'client': fila.iloc[3],
             'category': fila.iloc[4], 'subcategory': fila.iloc[5],
             'sku': fila.iloc[6], 'description': fila.iloc[7], 'model': 'exp_smooth',
             'date': og_date, 'value': og}, ignore_index=True)

    for i, test in enumerate(test_predictions):
        test_date = test_data.index[i]
        df_pred = df_pred._append(
            {'family': fila.iloc[0], 'region': fila.iloc[1], 'salesman': fila.iloc[2],
             'client': fila.iloc[3],
             'category': fila.iloc[4], 'subcategory': fila.iloc[5],
             'sku': fila.iloc[6], 'description': fila.iloc[7], 'model': 'actual',
             'date': test_date, 'value': fila[test_date]}, ignore_index=True)

        df_pred = df_pred._append(
            {'family': fila.iloc[0], 'region': fila.iloc[1], 'salesman': fila.iloc[2],
             'client': fila.iloc[3],
             'category': fila.iloc[4], 'subcategory': fila.iloc[5],
             'sku': fila.iloc[6], 'description': fila.iloc[7], 'model': 'exp_smooth',
             'date': test_date, 'value': test}, ignore_index=True)

    df_pred_pivot = df_pred.pivot(values='value', index=['family', 'region', 'salesman', 'client', 'category',
                                                         'subcategory', 'sku', 'description', 'model'],
                                  columns='date')

    mape = mape_calc(df_pred_pivot, 'exp_smooth')

    for i, future in enumerate(future_dates):
        fut_date = future_dates[i]
        df_pred_fc = df_pred_fc._append(
            {'family': fila.iloc[0], 'region': fila.iloc[1], 'salesman': fila.iloc[2],
             'client': fila.iloc[3],
             'category': fila.iloc[4], 'subcategory': fila.iloc[5],
             'sku': fila.iloc[6], 'description': fila.iloc[7], 'model': 'actual',
             'date': fut_date, 'value': None}, ignore_index=True)

        df_pred_fc = df_pred_fc._append(
            {'family': fila.iloc[0], 'region': fila.iloc[1], 'salesman': fila.iloc[2],
             'client': fila.iloc[3],
             'category': fila.iloc[4], 'subcategory': fila.iloc[5],
             'sku': fila.iloc[6], 'description': fila.iloc[7], 'model': 'exp_smooth',
             'date': fut_date, 'value': future_predictions[i]}, ignore_index=True)

    df_pred_fc_pivot = df_pred_fc.pivot(values='value', index=['family', 'region', 'salesman', 'client', 'category',
                                                               'subcategory', 'sku', 'description', 'model'],
                                        columns='date')

    result = pd.concat([df_pred_pivot, df_pred_fc_pivot], axis=1)

    return result, mape