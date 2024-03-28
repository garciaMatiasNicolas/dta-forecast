import traceback
from ..Error import Error
from sklearn.linear_model import LinearRegression
import pandas as pd
import numpy as np


def linear_regression_predictions(fila, test_periods, prediction_periods, seasonal_periods, error_method,
                                  error_periods):
    try:

        df_pred = pd.DataFrame(columns=['Family', 'region', 'Salesman', 'Client', 'Category', 'Subcategory',
                                        'SKU', 'Description', 'model', 'date', 'value'])

        df_pred_fc = df_pred.copy()
        time_series = pd.Series(fila.iloc[12:]).astype(dtype='float')
        train_data = time_series[:-test_periods]
        test_data = time_series.iloc[-test_periods:]

        model = LinearRegression()
        x_train = pd.DataFrame(pd.to_numeric(pd.to_datetime(train_data.index))).astype(int).values.reshape(-1, 1)
        y_train = train_data.values.reshape(-1, 1)
        model.fit(x_train, y_train)

        # Use the model to make predictions on the testing data
        x_test = pd.DataFrame(pd.to_numeric(pd.to_datetime(test_data.index))).astype(int).values.reshape(-1, 1)

        test_predictions = np.squeeze(model.predict(x_test))
        train_predictions = np.squeeze(model.predict(x_train))

        # --------------------------------------------------------------------
        start_date = pd.to_datetime(test_data.index[-1])
        next_month = start_date + pd.DateOffset(months=1)
        future_dates = pd.date_range(start=next_month, periods=prediction_periods, freq='MS')
        future_dates = future_dates.strftime('%Y-%m-%d')

        x_future = pd.DataFrame(pd.to_numeric(pd.to_datetime(future_dates))).astype(int).values.reshape(-1, 1)
        future_predictions = np.squeeze(model.predict(x_future))
        # ----------------------------------------------------------------
        for i, og in enumerate(train_predictions):
            og_date = train_data.index[i]

            df_pred = df_pred._append(
                {'Family': fila.iloc[0], 'region': fila.iloc[1], 'Salesman': fila.iloc[2],
                 'Client': fila.iloc[3],
                 'Category': fila.iloc[4], 'Subcategory': fila.iloc[5],
                 'SKU': fila.iloc[6], 'Description': fila.iloc[7], 'model': 'actual',
                 'date': og_date, 'value': fila[og_date]}, ignore_index=True)

            df_pred = df_pred._append(
                {'Family': fila.iloc[0], 'region': fila.iloc[1], 'Salesman': fila.iloc[2],
                 'Client': fila.iloc[3],
                 'Category': fila.iloc[4], 'Subcategory': fila.iloc[5],
                 'SKU': fila.iloc[6], 'Description': fila.iloc[7], 'model': 'linear',
                 'date': og_date, 'value': (0 if og < 0 else og)}, ignore_index=True)

        for i, test in enumerate(test_predictions):
            test_date = test_data.index[i]
            df_pred = df_pred._append(
                {'Family': fila.iloc[0], 'region': fila.iloc[1], 'Salesman': fila.iloc[2],
                 'Client': fila.iloc[3],
                 'Category': fila.iloc[4], 'Subcategory': fila.iloc[5],
                 'SKU': fila.iloc[6], 'Description': fila.iloc[7], 'model': 'actual',
                 'date': test_date, 'value': fila[test_date]}, ignore_index=True)

            df_pred = df_pred._append(
                {'Family': fila.iloc[0], 'region': fila.iloc[1], 'Salesman': fila.iloc[2],
                 'Client': fila.iloc[3],
                 'Category': fila.iloc[4], 'Subcategory': fila.iloc[5],
                 'SKU': fila.iloc[6], 'Description': fila.iloc[7], 'model': 'linear',
                 'date': test_date, 'value': test}, ignore_index=True)

        df_pred_pivot = df_pred.pivot(values='value', index=['Family', 'region', 'Salesman', 'Client', 'Category',
                                                             'Subcategory', 'SKU', 'Description', 'model'],
                                      columns='date')

        error = Error(dataframe=df_pred_pivot, model_name='linear', error_method=error_method,
                      error_periods=error_periods)

        error_calc, last_error = error.calculate_error()

        for i, future in enumerate(future_dates):
            fut_date = future_dates[i]
            df_pred_fc = df_pred_fc._append(
                {'Family': fila.iloc[0], 'region': fila.iloc[1], 'Salesman': fila.iloc[2],
                 'Client': fila.iloc[3],
                 'Category': fila.iloc[4], 'Subcategory': fila.iloc[5],
                 'SKU': fila.iloc[6], 'Description': fila.iloc[7], 'model': 'actual',
                 'date': fut_date, 'value': None}, ignore_index=True)

            df_pred_fc = df_pred_fc._append(
                {'Family': fila.iloc[0], 'region': fila.iloc[1], 'Salesman': fila.iloc[2],
                 'Client': fila.iloc[3],
                 'Category': fila.iloc[4], 'Subcategory': fila.iloc[5],
                 'SKU': fila.iloc[6], 'Description': fila.iloc[7], 'model': 'linear',
                 'date': fut_date, 'value':  (0 if future_predictions[i] < 0 else future_predictions[i])}, ignore_index=True)

        df_pred_fc_pivot = df_pred_fc.pivot(values='value', index=['Family', 'region', 'Salesman', 'Client', 'Category',
                                                                   'Subcategory', 'SKU', 'Description', 'model'],
                                            columns='date')

        result = pd.concat([df_pred_pivot, df_pred_fc_pivot], axis=1)

        return result, error_calc, last_error

    except Exception as err:
        traceback.print_exc()
        print("ERROR REGRESION LINEAL", str(err))
