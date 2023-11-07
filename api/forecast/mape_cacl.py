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


def mape_calc_by_month(data: list) -> list:
    mape_values = []

    for row in data:
        actual = []
        predicted = []

        for i, valor in enumerate(row):
            if i % 2 == 0:
                actual.append(valor)
            else:
                predicted.append(valor)

        mape = [abs((actual_val - predicted_val) / actual_val) * 100 if actual_val != 0 else 0 for
                actual_val, predicted_val in zip(actual, predicted)]

        mape_avg = sum(mape) / len(mape)
        mape_values.append(mape_avg)

    return mape_values
