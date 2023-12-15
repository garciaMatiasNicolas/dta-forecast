from ..mape_cacl import mape_calc
from statsmodels.tsa.holtwinters import ExponentialSmoothing
import pandas as pd


def holts_winters_holts_ema(row, test_periods, prediction_periods, model_name, seasonal_periods,
                          additional_params=None):
    try:
        df_pred = pd.DataFrame(columns=['family', 'region', 'salesman', 'client', 'category', 'subcategory',
                                        'sku', 'description', 'model', 'date', 'value'])

        df_pred_fc = df_pred.copy()

        time_series = pd.Series(row.iloc[12:]).astype(dtype='float')
        train_data = time_series[:-test_periods]
        test_data = time_series.iloc[-test_periods:]

        model = ''

        if model_name == 'holt_winters':
            trend, seasonal = additional_params['holtsWinters_params']

            model = ExponentialSmoothing(train_data, seasonal_periods=int(seasonal_periods),
                                         trend=trend, seasonal=seasonal)

        if model_name == 'holt':
            trend = additional_params['holts_params']

            model = ExponentialSmoothing(train_data, trend=trend[0])

        if model_name == 'exponential_moving_average':
            model = ExponentialSmoothing(train_data, trend=None, seasonal=None)  # EMA config

        # Fit the model
        model_fit = model.fit()

        # Make predictions on the testing data
        test_predictions = model_fit.forecast(test_periods)
        # Get the original values
        train_predictions = model_fit.fittedvalues
    # -----------------------------------------------------------------------
        start_date = pd.to_datetime(test_data.index[-1])
        next_month = start_date + pd.DateOffset(months=1)
        future_dates = pd.date_range(start=next_month, periods=prediction_periods, freq = 'MS')
        future_dates = future_dates.strftime('%Y-%m-%d')
        future_predictions = model_fit.forecast(prediction_periods)
    # -----------------------------------------------------------------------

        for i, og in enumerate(train_predictions):
            og_date = train_data.index[i]

            df_pred = df_pred._append(
                {'family': row.iloc[0], 'region': row.iloc[1], 'salesman': row.iloc[2],
                 'client': row.iloc[3],
                 'category': row.iloc[4], 'subcategory': row.iloc[5],
                 'sku': row.iloc[6], 'description': row.iloc[7], 'model': 'actual',
                 'date': og_date, 'value': row[og_date]}, ignore_index=True)

            df_pred = df_pred._append(
                {'family': row.iloc[0], 'region': row.iloc[1], 'salesman': row.iloc[2],
                 'client': row.iloc[3],
                 'category': row.iloc[4], 'subcategory': row.iloc[5],
                 'sku': row.iloc[6], 'description': row.iloc[7], 'model': model_name,
                 'date': og_date, 'value': (0 if og < 0 else og)}, ignore_index=True)

        for i, test in enumerate(test_predictions):
            test_date = test_data.index[i]
            df_pred = df_pred._append(
                {'family': row.iloc[0], 'region': row.iloc[1], 'salesman': row.iloc[2],
                 'client': row.iloc[3],
                 'category': row.iloc[4], 'subcategory': row.iloc[5],
                 'sku': row.iloc[6], 'description': row.iloc[7], 'model': 'actual',
                 'date': test_date, 'value': row[test_date]}, ignore_index=True)

            df_pred = df_pred._append(
                {'family': row.iloc[0], 'region': row.iloc[1], 'salesman': row.iloc[2],
                 'client': row.iloc[3],
                 'category': row.iloc[4], 'subcategory': row.iloc[5],
                 'sku': row.iloc[6], 'description': row.iloc[7], 'model': model_name,
                 'date': test_date, 'value': test}, ignore_index=True)

        df_pred_pivot = df_pred.pivot(values='value', index=['family', 'region', 'salesman', 'client', 'category',
                                                             'subcategory', 'sku', 'description', 'model'],
                                      columns='date')

        mape = mape_calc(df_pred_pivot, model_name)

        for i, future in enumerate(future_dates):
            fut_date = future_dates[i]
            df_pred_fc = df_pred_fc._append(
                {'family': row.iloc[0], 'region': row.iloc[1], 'salesman': row.iloc[2],
                 'client': row.iloc[3],
                 'category': row.iloc[4], 'subcategory': row.iloc[5],
                 'sku': row.iloc[6], 'description': row.iloc[7], 'model': 'actual',
                 'date': fut_date, 'value': None}, ignore_index=True)

            df_pred_fc = df_pred_fc._append(
                {'family': row.iloc[0], 'region': row.iloc[1], 'salesman': row.iloc[2],
                 'client': row.iloc[3],
                 'category': row.iloc[4], 'subcategory': row.iloc[5],
                 'sku': row.iloc[6], 'description': row.iloc[7], 'model': model_name,
                 'date': fut_date, 'value':  (0 if future_predictions[i] < 0 else future_predictions[i])}, ignore_index=True)

        df_pred_fc_pivot = df_pred_fc.pivot(values='value', index=['family', 'region', 'salesman', 'client', 'category',
                                                                   'subcategory', 'sku', 'description', 'model'],
                                            columns='date')

        result = pd.concat([df_pred_pivot, df_pred_fc_pivot], axis=1)

        return result, mape

    except Exception as err:
        print(str(err))
