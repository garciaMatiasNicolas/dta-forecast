from ..mape_cacl import mape_calc
from prophet import Prophet
import pandas as pd
import traceback
from dateutil.relativedelta import relativedelta


def prophet_predictions(fila, test_periods, prediction_periods):
    try:
        df_pred = pd.DataFrame(columns=['family', 'region', 'salesman', 'client', 'category', 'subcategory',
                                        'sku', 'description', 'model', 'date', 'value'])

        df_pred_fc = df_pred.copy()
        time_series = pd.Series(fila.iloc[12:]).astype(dtype='float')
        train_data = time_series[:-test_periods]
        test_data = time_series.iloc[-test_periods:]

        df_prophet = pd.DataFrame({'ds': train_data.index, 'y': train_data.values})

        # Use the model to make predictions on the testing data
        model = Prophet()
        model.fit(df_prophet)

        # --------------------------------------------------------------------
        start_date = pd.to_datetime(test_data.index[-1])
        next_month = start_date + pd.DateOffset(months=1)
        future_dates = pd.date_range(start=next_month, periods=prediction_periods, freq='MS')

        future_df = pd.DataFrame({'ds': future_dates})

        forecast = model.predict(future_df)

        test_predictions = forecast[-test_periods:]['yhat'].values
        train_predictions = model.predict(df_prophet)['yhat'].values
        # --------------------------------------------------------------------

        for i, og in enumerate(train_predictions):
            og_date = train_data.index[i]

            df_pred = df_pred._append({
                'family': fila.iloc[0], 'region': fila.iloc[1], 'salesman': fila.iloc[2], 'client': fila.iloc[3],
                'category': fila.iloc[4], 'subcategory': fila.iloc[5],
                'sku': fila.iloc[6], 'description': fila.iloc[7], 'model': 'actual',
                'date': og_date, 'value': fila[og_date]
            }, ignore_index=True)

            df_pred = df_pred._append({
                'family': fila.iloc[0], 'region': fila.iloc[1], 'salesman': fila.iloc[2],
                'client': fila.iloc[3],
                'category': fila.iloc[4], 'subcategory': fila.iloc[5],
                'sku': fila.iloc[6], 'description': fila.iloc[7], 'model': 'prophet',
                'date': og_date, 'value': og
            }, ignore_index=True)

        for i, test in enumerate(test_predictions):
            test_date = test_data.index[i]
            df_pred = df_pred._append({
                'family': fila.iloc[0], 'region': fila.iloc[1], 'salesman': fila.iloc[2],
                'client': fila.iloc[3],
                'category': fila.iloc[4], 'subcategory': fila.iloc[5],
                'sku': fila.iloc[6], 'description': fila.iloc[7], 'model': 'actual',
                'date': test_date, 'value': fila[test_date]
            }, ignore_index=True)

            df_pred = df_pred._append({
                'family': fila.iloc[0], 'region': fila.iloc[1], 'salesman': fila.iloc[2],
                'client': fila.iloc[3],
                'category': fila.iloc[4], 'subcategory': fila.iloc[5],
                'sku': fila.iloc[6], 'description': fila.iloc[7], 'model': 'prophet',
                'date': test_date, 'value': test
            }, ignore_index=True)

        df_pred_pivot = df_pred.pivot_table(values='value', index=['family', 'region', 'salesman', 'client', 'category',
                                                                   'subcategory', 'sku', 'description', 'model'],
                                            columns='date')

        mape = mape_calc(df_pred_pivot, 'prophet')

        future_pred_dates = forecast[-prediction_periods:]['ds'].dt.strftime('%Y-%m-%d')

        for i, fut_date in enumerate(future_pred_dates):
            df_pred_fc = df_pred_fc._append({
                'family': fila.iloc[0], 'region': fila.iloc[1], 'salesman': fila.iloc[2],
                'client': fila.iloc[3],
                'category': fila.iloc[4], 'subcategory': fila.iloc[5],
                'sku': fila.iloc[6], 'description': fila.iloc[7], 'model': 'actual',
                'date': fut_date, 'value': None
            }, ignore_index=True)

            df_pred_fc = df_pred_fc._append({
                'family': fila.iloc[0], 'region': fila.iloc[1], 'salesman': fila.iloc[2],
                'client': fila.iloc[3],
                'category': fila.iloc[4], 'subcategory': fila.iloc[5],
                'sku': fila.iloc[6], 'description': fila.iloc[7], 'model': 'prophet',
                'date': fut_date, 'value': forecast['yhat'].iloc[-prediction_periods:].values[i]
            }, ignore_index=True)

        df_pred_fc_pivot = df_pred_fc.pivot_table(values='value',
                                                  index=['family', 'region', 'salesman', 'client', 'category',
                                                         'subcategory', 'sku', 'description', 'model'],
                                                  columns='date')

        result = pd.concat([df_pred_pivot, df_pred_fc_pivot], axis=1)

        return result, mape

    except Exception as err:
        traceback.print_exc()
        print(f"Error prophet_pred: {str(err)}")



