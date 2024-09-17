import pandas as pd
import multiprocessing
from .ForecastModels import ForecastModels
from .Error import Error
from joblib import Parallel, delayed
import warnings

warnings.filterwarnings("ignore")


class Forecast(object):

    def __init__(self, df: pd.DataFrame, prediction_periods: int, test_periods: int, error_periods: int, error_method: str, seasonal_periods: int, 
                models: list = None, additional_params=None, explosive_variable=None, detect_outliers=True, df_exog: pd.DataFrame = None, max_date = None):

        self.initial_data = df
        self.initial_dates = []
        self.result_data = pd.DataFrame()
        self.prediction_periods = prediction_periods
        self.df_exog = df_exog
        self.max_date = max_date
        
        if test_periods == 1:
            self.test_periods = 2
        else:
            self.test_periods = test_periods

        self.additional_params = additional_params
        self.error_periods = error_periods
        self.error_method = error_method
        self.seasonal_periods = seasonal_periods
        self.models = models
        self.date_columns = []
        self.future_dates = []
        self.explosive_variable = explosive_variable
        self.detect_outliers = detect_outliers

    @staticmethod
    def format_dates(dates):
        dates = pd.to_datetime(dates)
        dates = dates.strftime('%Y-%m-%d').tolist()
        return dates

    def format_initial_data(self):
        formatted_data = self.initial_data.copy()
        formatted_data = formatted_data.iloc[:, 12:]

        # Get all dates and set date columns with the predicted periods
        self.date_columns = self.format_dates(dates=formatted_data.columns)
        last_date = pd.to_datetime(self.date_columns[-1])
        next_month = last_date + pd.DateOffset(months=1)
        future_dates = pd.date_range(start=next_month, periods=self.prediction_periods, freq='MS')
        future_dates = self.format_dates(dates=future_dates)

        self.initial_dates = self.date_columns
        self.date_columns = self.date_columns + future_dates
        self.future_dates = future_dates

        if self.df_exog is not None:
            formatted_data_exog = self.df_exog.copy() 
            return self.initial_data.copy(), formatted_data_exog

        else:
            return self.initial_data.copy(), None
        
    def format_result_data(self, forecast_df: pd.DataFrame, actual_df: pd.DataFrame):
        actual_dataframe = actual_df.drop(columns=["Starting Year", "Starting Period", "Periods Per Year",
                                                   "Periods Per Cycle"])

        sku_index = actual_dataframe.columns.get_loc("Description")
        actual_dataframe.insert(loc=sku_index + 1, column="model", value="actual")
        actual_dataframe[self.future_dates] = 0.0
        actual_dataframe[self.error_method] = ""
        actual_dataframe["LAST ERROR"] = ""

        actual_dataframe.columns = ['Family', 'Region', 'Salesman', 'Client', 'Category', 'Subcategory',
                                    'SKU', 'Description', 'model'] + self.date_columns + [self.error_method] + ["LAST ERROR"]

        predicted_dataframe = pd.concat([actual_dataframe, forecast_df], ignore_index=True)
        predicted_dataframe.fillna({f'{self.error_method}': 0}, inplace=True)

        return predicted_dataframe

    def parallel_process(self, data, model_name: str, actual: dict, exog_data=None):
        num_cores = int(multiprocessing.cpu_count() * 0.8)
        data_list = [row.tolist() for idx, row in data.iloc[:, 12:].iterrows()]

        if model_name in ["holtsWintersExponentialSmoothing", "holtsExponentialSmoothing", "exponential_moving_average"]:
            results = Parallel(n_jobs=round(num_cores))(
                delayed(ForecastModels.holt_holtwinters_ema)(idx, row, self.test_periods, self.prediction_periods,
                                                             model_name, self.seasonal_periods) for idx, row in enumerate(data_list, 1))

        elif model_name == "arima":
            results = Parallel(n_jobs=round(num_cores))(
                delayed(ForecastModels.arima)(idx, row, self.test_periods, self.prediction_periods,
                                              self.additional_params) for idx, row in enumerate(data_list, 1))
        
        elif model_name == "arimax":
            data_list_for_exog = [row.tolist() for idx, row in data.iterrows()] 
            results = Parallel(n_jobs=round(num_cores))(
                delayed(ForecastModels.arimax)(idx=idx, row=row, exog_data=exog_data, test_periods=self.test_periods, prediction_periods=self.prediction_periods, additional_params=self.additional_params, max_date=self.max_date)
                for idx, row in enumerate(data_list_for_exog, 1))
        
        elif model_name == "sarimax":
            data_list_for_exog = [row.tolist() for idx, row in data.iterrows()] 
            results = Parallel(n_jobs=round(num_cores))(
                delayed(ForecastModels.sarimax)(idx=idx, row=row, exog_data=exog_data, test_periods=self.test_periods, prediction_periods=self.prediction_periods, additional_params=self.additional_params, max_date=self.max_date)
                for idx, row in enumerate(data_list_for_exog, 1))
        
        elif model_name == "prophet_exog":
            data_list_for_exog = [row.tolist() for idx, row in data.iterrows()]
            results = Parallel(n_jobs=round(num_cores))(
                delayed(ForecastModels.prophet_exog)(idx=idx, row=row, exog_data=exog_data, prediction_periods=self.prediction_periods, dates=self.initial_dates, max_date=self.max_date)
                for idx, row in enumerate(data_list_for_exog, 1)) 

        elif model_name == "sarima":
            results = Parallel(n_jobs=round(num_cores))(
                delayed(ForecastModels.arima)(idx, row, self.test_periods, self.prediction_periods,
                                              self.additional_params) for idx, row in enumerate(data_list, 1))

        elif model_name == "simpleExponentialSmoothing":
            results = Parallel(n_jobs=round(num_cores))(
                delayed(ForecastModels.exponential_smoothing)(idx, row, self.test_periods, self.prediction_periods)
                for idx, row in enumerate(data_list, 1))

        elif model_name == "prophet":
            additional_params = self.additional_params.get("prophet_params", None)
            results = Parallel(n_jobs=round(num_cores))(
                delayed(ForecastModels.prophet)(idx, row, self.prediction_periods, additional_params, 12, self.initial_dates, self.detect_outliers)
                for idx, row in enumerate(data_list, 1))

        elif model_name == "decisionTree":
            results = Parallel(n_jobs=round(num_cores))(
                delayed(ForecastModels.decision_tree)(idx, row, self.test_periods, self.prediction_periods, self.initial_dates)
                for idx, row in enumerate(data_list, 1))

        elif model_name == "lasso":
            results = Parallel(n_jobs=round(num_cores))(
                delayed(ForecastModels.lasso)(idx, row, self.test_periods, self.prediction_periods)
                for idx, row in enumerate(data_list, 1))

        elif model_name == "linearRegression":
            results = Parallel(n_jobs=round(num_cores))(
                delayed(ForecastModels.linear)(idx, row, self.test_periods, self.prediction_periods, self.initial_dates)
                for idx, row in enumerate(data_list, 1))

        elif model_name == "bayesian":
            results = Parallel(n_jobs=round(num_cores))(
                delayed(ForecastModels.bayesian)(idx, row, self.test_periods, self.prediction_periods, self.initial_dates)
                for idx, row in enumerate(data_list, 1))

        predicted = {}

        for product_idx, result in results:
            actual_sales = actual[f"Producto {product_idx}"]
            predicted_sales = [round(num, 2) for num in result[:len(actual_sales)]]

            error = Error(error_method=self.error_method, error_periods=self.error_periods, actual=actual_sales,
                          predicted=predicted_sales)

            error, last_period_error = error.calculate_error_periods_selected()

            result.append(error)
            result.append(last_period_error)
            predicted_sales_with_mape = result

            predicted[f"Producto {product_idx}"] = predicted_sales_with_mape

        return predicted

    def run_forecast(self):
        data, exog_data = self.format_initial_data()

        actual_dataframe = self.initial_data.copy()
        actual_for_error_calc = actual_dataframe.iloc[:, 12:]
        model_results = {}
        actual_dict = {}
        i = 1

        for idx, row in actual_for_error_calc.iterrows():
            product_name = f'Producto {i}'
            sales_values = actual_for_error_calc.iloc[idx].tolist()
            actual_dict[product_name] = sales_values
            i = i + 1

        for model_name in self.models:
            forecast_results = self.parallel_process(data=data, model_name=model_name, actual=actual_dict, exog_data=exog_data)
            forecast_results_df = pd.DataFrame(forecast_results).T.reset_index()
            forecast_results_df.columns = ["Producto"] + self.date_columns + [self.error_method] + ["LAST ERROR"]

            predicted_dataframe = actual_dataframe.iloc[:, :8].copy()
            predicted_dataframe["model"] = model_name

            for col in forecast_results_df.columns[1:]:
                predicted_dataframe[col] = forecast_results_df[col]

            predicted_dataframe[self.error_method] = forecast_results_df[self.error_method]
            predicted_dataframe["LAST ERROR"] = forecast_results_df["LAST ERROR"]

            model_results[model_name] = predicted_dataframe

        predicted_dataframe = pd.concat(model_results.values(), ignore_index=True)
        final_df = self.format_result_data(forecast_df=predicted_dataframe, actual_df=actual_dataframe)

        return final_df

    @staticmethod
    def select_best_model(df: pd.DataFrame, error_method: str, models: list):
        key_columns = ['Family', 'Region', 'Salesman', 'Client', 'Category', 'Subcategory', 'SKU', 'Description']

        # Inicializamos la columna 'best_model' con 0
        df['best_model'] = 0

        # Iteramos sobre cada grupo de filas basados en las key_columns
        for _, group in df.groupby(key_columns):
            # Fila con el valor actual
            actual_row = group[group['model'] == 'actual']

            # Filas de los modelos seleccionados
            model_rows = group[group['model'].isin(models)]

            # Si hay modelos en el grupo
            if not model_rows.empty:
                # Encontramos la fila con el menor valor de error según el método de error
                best_model_idx = model_rows[error_method].astype(float).idxmin()

                # Asignamos 1 en la columna 'best_model' para el mejor modelo
                df.loc[best_model_idx, 'best_model'] = 1

        # Retornamos el dataframe con la nueva columna
        return df
