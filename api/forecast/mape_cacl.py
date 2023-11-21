def mape_calc(dataframe, model_name):
    last_twelve_periods_predicted = dataframe.xs(model_name, level='model').iloc[:, -12:]
    last_twelve_periods_actual = dataframe.xs('actual', level='model').iloc[:, -12:]

    absolute_errors = []

    for col in last_twelve_periods_predicted.columns:
        predicted_col = last_twelve_periods_predicted[col]
        actual_col = last_twelve_periods_actual[col]

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


def mape_calc_last_period(dataframe, predictions_periods):
    last_period_column = predictions_periods + 2
    last_period = dataframe.iloc[:, -last_period_column]

    mapes = []

    for i in range(0, len(last_period), 2):
        actual = last_period[i]
        predicted = last_period[i + 1]
        mape = mape_calc_reports(predicted, actual)
        mapes.append(mape)

    mape_last_period = round(sum(mapes) / len(mapes), 2)
    return mape_last_period


def mape_calc_reports(predicted: float, actual: float):
    if actual == 0 and predicted == 0:
        mape = 0
    elif (actual == 0 or actual < 0) and predicted != 0:
        mape = 100
    else:
        mape = abs((actual - predicted) / actual) * 100

    return round(mape, 2)