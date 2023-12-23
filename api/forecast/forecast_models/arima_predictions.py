from ..Error import Error
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX
import pandas as pd
import pmdarima as pm
import traceback


def arima_sarima_arimax_sarimax_predictions(row, test_periods, prediction_periods, seasonal_periods,
                                            additional_params, model_name: str, error_method, row_exog_data=None):
    try:
        df_pred = pd.DataFrame(columns=['family', 'region', 'salesman', 'client', 'category', 'subcategory',
                                        'sku', 'description', 'model', 'date', 'value'])

        df_pred_fc = df_pred.copy()
        time_series = pd.Series(row.iloc[12:]).astype(dtype='float')
        train_data = time_series[:-test_periods]
        test_data = time_series.iloc[-test_periods:]
        n_train = len(train_data)
        model = pm.auto_arima(train_data)
        arima_order = model.order

        Pvalue, Dvalue, Qvalue = additional_params[f'{model_name}_params']
        seasonal_order = (int(Pvalue), int(Dvalue), int(Qvalue), int(seasonal_periods))

        ## SARIMA - SARIMAX ##

        if model_name == 'sarima' or model_name == 'sarimax':
            ## SARIMAX WITH EXOG DATA ##
            if row_exog_data is not None:
                exog_data = row_exog_data.iloc[8:].astype('float')
                model = SARIMAX(train_data, exog=exog_data[:-test_periods], order=arima_order,
                                seasonal_order=seasonal_order)
                model.initialize_approximate_diffuse()
                model_fit = model.fit()
                train_predictions = model_fit.predict(start=0, end=n_train - 1)
                test_predictions = model_fit.predict(start=n_train, end=len(time_series) - 1,
                                                     exog=exog_data[-test_periods:])

            ## SARIMA WITHOUT EXOG DATA ##
            else:
                model = SARIMAX(train_data, order=arima_order, seasonal_order=seasonal_order)
                model.initialize_approximate_diffuse()
                model_fit = model.fit()
                train_predictions = model_fit.predict(start=0, end=n_train - 1)
                test_predictions = model_fit.predict(start=n_train, end=len(time_series) - 1)

            start_date = pd.to_datetime(test_data.index[-1])
            next_month = start_date + pd.DateOffset(months=1)
            future_dates = pd.date_range(start=next_month, periods=prediction_periods, freq='MS')
            future_dates = future_dates.strftime('%Y-%m-%d')

            if row_exog_data is not None:
                exog_data = row_exog_data.iloc[8:].astype('float')
                future_predictions = model_fit.forecast(prediction_periods)

            else:
                future_predictions = model_fit.forecast(prediction_periods)

        ## ARIMA - ARIMAX ##
        else:
            ## ARIMA WITHOUT EXOG DATA ##
            model = ARIMA(train_data, order=arima_order, seasonal_order=seasonal_order)
            model.initialize_approximate_diffuse()
            model_fit = model.fit()
            train_predictions = model_fit.predict(start=0, end=n_train - 1)
            test_predictions = model_fit.predict(start=n_train, end=len(time_series) - 1)

            start_date = pd.to_datetime(test_data.index[-1])
            next_month = start_date + pd.DateOffset(months=1)
            future_dates = pd.date_range(start=next_month, periods=prediction_periods, freq='MS')
            future_dates = future_dates.strftime('%Y-%m-%d')
            future_predictions = model_fit.forecast(prediction_periods)

        # -------------------------------------------------------------
        for i, og in enumerate(train_predictions):
            og_date = train_data.index[i]

            df_pred = df_pred._append(
                {'family': row.iloc[0], 'region': row.iloc[1], 'salesman': row.iloc[2], 'client': row.iloc[3],
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
                 'client': row.iloc[3], 'category': row.iloc[4], 'subcategory': row.iloc[5],
                 'sku': row.iloc[6], 'description': row.iloc[7], 'model': 'actual',
                 'date': test_date, 'value': row[test_date]}, ignore_index=True)

            df_pred = df_pred._append(
                {'family': row.iloc[0], 'region': row.iloc[1], 'salesman': row.iloc[2],
                 'client': row.iloc[3], 'category': row.iloc[4], 'subcategory': row.iloc[5],
                 'sku': row.iloc[6], 'description': row.iloc[7], 'model': model_name,
                 'date': test_date, 'value': test}, ignore_index=True)

        df_pred_pivot = df_pred.pivot(values='value', index=['family', 'region', 'salesman', 'client', 'category',
                                                             'subcategory', 'sku', 'description', 'model'],
                                      columns='date')

        error = Error(dataframe=df_pred_pivot, model_name=model_name, error_method=error_method)
        error_calc = error.calculate_error()

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
                 'date': fut_date, 'value': (0 if future_predictions[i] < 0 else future_predictions[i])},
                ignore_index=True)

        df_pred_fc_pivot = df_pred_fc.pivot(values='value', index=['family', 'region', 'salesman', 'client', 'category',
                                                                   'subcategory', 'sku', 'description', 'model'],
                                            columns='date')

        result = pd.concat([df_pred_pivot, df_pred_fc_pivot], axis=1)

        return result, error_calc

    except Exception as err:
        traceback.print_exc()
        print(f"Error arima : {str(err)}")
        print(f"Fila con error {row}")
