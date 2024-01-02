import numpy as np
import pandas as pd


class Error:

    def __init__(self, model_name: str, error_method: str, dataframe: pd.DataFrame = None):
        self.df = dataframe
        self.model_name = model_name
        self.error_method = error_method

        if self.error_method not in ['MAE', 'MAPE', 'SMAPE', 'RMSE']:
            raise ValueError("Invalid error_method. Use 'smape', 'mape', 'rmse', or 'mae'.")

    def calculate_error(self) -> float:
        absolute_errors = []
        last_twelve_periods_predicted = self.df.xs(self.model_name, level='model').iloc[:, -12:]
        last_twelve_periods_actual = self.df.xs('actual', level='model').iloc[:, -12:]

        if (not all(last_twelve_periods_predicted.dtypes == float)
                or not all(last_twelve_periods_actual.dtypes == float)):
            raise ValueError("Column type must be numeric")

        for col in last_twelve_periods_predicted.columns:
            predicted_col = last_twelve_periods_predicted[col]
            actual_col = last_twelve_periods_actual[col]

            n = len(actual_col)
            col_errors = []

            for i in range(n):
                if actual_col[i] == 0.0 and predicted_col[i] == 0.0:
                    col_errors.append(0)

                elif actual_col[i] == 0.0 or actual_col[i] < 0.0:
                    col_errors.append(200)

                else:
                    if self.error_method == 'SMAPE':
                        col_errors.append(
                            abs((actual_col[i] - predicted_col[i]) / ((actual_col[i] + predicted_col[i]) / 2)) * 100)

                    if self.error_method == 'MAPE':
                        col_errors.append(abs((actual_col[i] - predicted_col[i]) / actual_col[i]) * 100)

                    if self.error_method == 'RMSE':
                        col_errors.append((actual_col[i] - predicted_col[i]) ** 2)

                    if self.error_method == 'MAE':
                        col_errors.append(abs(actual_col[i] - predicted_col[i]))

            col_error = 0

            if self.error_method == 'SMAPE' or self.error_method == 'MAPE':
                col_error = sum(col_errors) / n

            elif self.error_method == 'RMSE':
                col_error = np.sqrt(sum(col_errors) / n)

            elif self.error_method == 'MAE':
                col_error = sum(col_errors) / n

            absolute_errors.append(col_error)

        result = sum(absolute_errors) / len(absolute_errors)
        return round(result, 2)

    def calculate_error_last_period(self, prediction_periods: int) -> tuple[float, float]:
        methods = {
            'MAPE': Error.calculate_mape,
            'SMAPE': Error.calculate_smape,
            'RMSE': Error.calculate_rmse,
            'MAE': Error.calculate_mae
        }

        last_period_column = prediction_periods + 2
        last_period = self.df.iloc[:, -last_period_column]

        values = []
        actual_vals = []
        predicted_vals = []

        for i in range(0, len(last_period), 2):
            actual = last_period[i]
            predicted = last_period[i + 1]
            actual_vals.append(actual)
            predicted_vals.append(predicted)
            error = 0

            if self.error_method in methods:
                calc_error = methods[self.error_method]
                error = calc_error(predicted, actual)

            values.append(error)

        absolute_error = 0
        if self.error_method == 'MAPE':
            absolute_error = self.calculate_mape(predicted=sum(predicted_vals), actual=sum(actual_vals))

        if self.error_method == 'SMAPE':
            absolute_error = self.calculate_smape(predicted=sum(predicted_vals), actual=sum(actual_vals))

        if self.error_method == 'MAE':
            absolute_error = self.calculate_mae(predicted=sum(predicted_vals), actual=sum(actual_vals))

        if self.error_method == 'RMSE':
            absolute_error = self.calculate_rmse(predicted=sum(predicted_vals), actual=sum(actual_vals))

        error_last_period = round(sum(values) / len(values), 2)

        return error_last_period, absolute_error

    @staticmethod
    def calculate_mape(actual: float, predicted: float) -> float:
        if actual == 0 and predicted == 0:
            mape = 0
        elif (actual == 0 or actual < 0) and predicted != 0:
            mape = 100
        else:
            mape = abs((actual - predicted) / actual) * 100

        return round(mape, 2)

    @staticmethod
    def calculate_rmse(actual: float, predicted: float) -> float:
        if actual == 0 and predicted == 0:
            rmse = 0
        elif (actual == 0 or actual < 0) and predicted != 0:
            rmse = 100
        else:
            rmse = (actual - predicted) ** 2

        return np.sqrt(rmse)

    @staticmethod
    def calculate_mae(actual: float, predicted: float) -> float:
        if actual == 0 and predicted == 0:
            mae = 0
        elif (actual == 0 or actual < 0) and predicted != 0:
            mae = 100
        else:
            mae = abs(actual - predicted)

        return mae

    @staticmethod
    def calculate_smape(actual: float, predicted: float) -> float:
        if actual == 0 and predicted == 0:
            smape = 0
        elif (actual == 0 or actual < 0) and predicted != 0:
            smape = 100
        else:
            smape = abs((actual - predicted) / ((actual + predicted) / 2)) * 100

        return smape
