def mape_calc(dataframe, model_name):
    predicted_dataframe = dataframe.xs(model_name, level='model').iloc[:, -12:]
    actual_df = dataframe.xs('actual', level='model').iloc[:, -12:]

    absolute_errors = []

    for col in predicted_dataframe.columns:
        predicted_col = predicted_dataframe[col]
        actual_col = actual_df[col]

        if not (predicted_col.dtype == float and actual_col.dtype == float):
            raise ValueError("Column type must be numeric")

        n = len(actual_col)
        col_errors = []

        for i in range(n):
            if actual_col[i] == 0.0 and predicted_col[i] == 0.0:
                col_errors.append(0)

            elif actual_col[i] == 0.0 or actual_col[i] < 0.0:
                col_errors.append(100)

            else:
                col_errors.append(abs((actual_col[i] - predicted_col[i]) / actual_col[i]) * 100)

        col_mape = sum(col_errors) / n
        absolute_errors.append(col_mape)

    mape = sum(absolute_errors) / len(absolute_errors)

    return round(mape, 2)


def mape_calc_reports(predicted: float, actual: float):
    if actual == 0 and predicted == 0:
        mape = 0
    elif actual == 0 and predicted != 0:
        mape = 100
    else:
        mape = abs((actual - predicted) / actual) * 100

    return round(mape, 2)