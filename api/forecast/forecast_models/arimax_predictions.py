from ..Error import Error
from statsmodels.tsa.arima.model import ARIMA
import pandas as pd
import pmdarima as pm
import traceback


def arimax_predictions(row, test_periods, prediction_periods, seasonal_periods, error_method, error_periods):
    try:
        df_pred = pd.DataFrame(columns=['Family', 'Region', 'Salesman', 'Client', 'Category', 'Subcategory',
                                        'SKU', 'Description', 'model', 'date', 'value'])

        df_pred_fc = df_pred.copy()
        time_series = pd.Series(row.iloc[12:]).astype(dtype='float')
        train_data = time_series[:-test_periods]
        test_data = time_series.iloc[-test_periods:]
        n_train = len(train_data)
        model = pm.auto_arima(train_data)
        arima_order = model.order

        model = ARIMA(train_data, order=arima_order, seasonal_order=(0, 0, 0, seasonal_periods))
        model.initialize_approximate_diffuse()
        model_fit = model.fit()
        train_predictions = model_fit.predict(start=0, end=n_train - 1)
        test_predictions = model_fit.predict(start=n_train, end=len(time_series) - 1)

        start_date = pd.to_datetime(test_data.index[-1])
        next_month = start_date + pd.DateOffset(months=1)
        future_dates = pd.date_range(start=next_month, periods=prediction_periods, freq='MS')
        future_dates = future_dates.strftime('%Y-%m-%d')
        future_predictions = model_fit.forecast(prediction_periods)

        for i, og in enumerate(train_predictions):
            og_date = train_data.index[i]

            df_pred = df_pred._append(
                {'Family': row.iloc[0], 'Region': row.iloc[1], 'Salesman': row.iloc[2], 'Client': row.iloc[3],
                 'Category': row.iloc[4], 'Subcategory': row.iloc[5],
                 'SKU': row.iloc[6], 'Description': row.iloc[7], 'model': 'actual',
                 'date': og_date, 'value': row[og_date]}, ignore_index=True)

            df_pred = df_pred._append(
                {'Family': row.iloc[0], 'Region': row.iloc[1], 'Salesman': row.iloc[2],
                 'Client': row.iloc[3],
                 'Category': row.iloc[4], 'Subcategory': row.iloc[5],
                 'SKU': row.iloc[6], 'Description': row.iloc[7], 'model': 'arimax',
                 'date': og_date, 'value': (0 if og < 0 else og)}, ignore_index=True)

        for i, test in enumerate(test_predictions):
            test_date = test_data.index[i]
            df_pred = df_pred._append(
                {'Family': row.iloc[0], 'Region': row.iloc[1], 'Salesman': row.iloc[2],
                 'Client': row.iloc[3], 'Category': row.iloc[4], 'Subcategory': row.iloc[5],
                 'SKU': row.iloc[6], 'Description': row.iloc[7], 'model': 'actual',
                 'date': test_date, 'value': row[test_date]}, ignore_index=True)

            df_pred = df_pred._append(
                {'Family': row.iloc[0], 'Region': row.iloc[1], 'Salesman': row.iloc[2],
                 'Client': row.iloc[3], 'Category': row.iloc[4], 'Subcategory': row.iloc[5],
                 'SKU': row.iloc[6], 'Description': row.iloc[7], 'model': 'arimax',
                 'date': test_date, 'value': test}, ignore_index=True)

        df_pred_pivot = df_pred.pivot(values='value', index=['Family', 'Region', 'Salesman', 'Client', 'Category',
                                                             'Subcategory', 'SKU', 'Description', 'model'],
                                      columns='date')

        error = Error(dataframe=df_pred_pivot, model_name='arimax', error_method=error_method, error_periods=error_periods)
        error_calc, last_error = error.calculate_error()

        for i, future in enumerate(future_dates):
            fut_date = future_dates[i]
            df_pred_fc = df_pred_fc._append(
                {'Family': row.iloc[0], 'Region': row.iloc[1], 'Salesman': row.iloc[2],
                 'Client': row.iloc[3],
                 'Category': row.iloc[4], 'Subcategory': row.iloc[5],
                 'SKU': row.iloc[6], 'Description': row.iloc[7], 'model': 'actual',
                 'date': fut_date, 'value': None}, ignore_index=True)

            df_pred_fc = df_pred_fc._append(
                {'Family': row.iloc[0], 'Region': row.iloc[1], 'Salesman': row.iloc[2],
                 'Client': row.iloc[3],
                 'Category': row.iloc[4], 'Subcategory': row.iloc[5],
                 'SKU': row.iloc[6], 'Description': row.iloc[7], 'model': 'arimax',
                 'date': fut_date, 'value': (0 if future_predictions[i] < 0 else future_predictions[i])},
                ignore_index=True)

        df_pred_fc_pivot = df_pred_fc.pivot(values='value', index=['Family', 'Region', 'Salesman', 'Client', 'Category',
                                                                   'Subcategory', 'SKU', 'Description', 'model'],
                                            columns='date')

        result = pd.concat([df_pred_pivot, df_pred_fc_pivot], axis=1)

        return result, error_calc, last_error

    except Exception as err:
        traceback.print_exc()
        print(f"Error arimax : {str(err)}")