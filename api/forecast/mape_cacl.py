# Function to calculate mape in models
def mape_calc(dataframe, model_name):
    predicted_dataframe = dataframe.xs(model_name, level='model').iloc[:, -12:]
    actual_df = dataframe.xs('actual', level='model').iloc[:, -12:]
    absolute_errors = []

    for col in predicted_dataframe.columns:
        predicted_col = predicted_dataframe[col]
        actual_col = actual_df[col]

        if not (predicted_col.dtype == float and actual_col.dtype == float):
            raise ValueError("Column type must e numeric")

        n = len(actual_col)
        col_errors = []
        for i in range(n):
            if actual_col[i] == 0 and predicted_col[i] != 0:
                col_errors.append(1)  # 100% relative error
            else:
                if actual_col[i] == 0:
                    col_errors.append(0)
                else:
                    col_errors.append(abs(predicted_col[i] - actual_col[i]) / actual_col[i])

        col_mape = sum(col_errors) / n * 100
        absolute_errors.append(col_mape)

    mape = sum(absolute_errors) / len(absolute_errors)

    return mape


# Functions to calculate mape for the past twelve months
def calculate_mape(actual_values, predicted_values):
    if len(actual_values) != len(predicted_values):
        raise ValueError("Lists lengths doesn't match")

    absolute_percentage_errors = []

    for actual, predicted in zip(actual_values, predicted_values):
        absolute_percentage_error = []
        for a, p in zip(actual, predicted):
            if a == 0:
                absolute_percentage_error.append(0)
            else:
                absolute_percentage_error.append(abs((a - p) / a) * 100)
        absolute_percentage_errors.append(absolute_percentage_error)

    mape_values = []

    for errors in absolute_percentage_errors:
        mape = round(sum(errors) / len(errors), 2)
        mape_values.append(mape)

    return mape_values


def mape_calc_by_month(data: list) -> list:
    mape_values = []

    for row in data:
        actual = []
        predicted = []

        for index, value in enumerate(row):
            if index % 2 == 0 or index == 0:
                actual.append(value)
            else:
                predicted.append(value)

        mape_per_month = calculate_mape(actual_values=actual, predicted_values=predicted)
        mape_values.append(mape_per_month)

    return mape_values