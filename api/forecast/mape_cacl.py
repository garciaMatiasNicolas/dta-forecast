# Function to calculate mape in models
def mape_calc(dataframe, model_name):
    predicted_dataframe = dataframe.xs(model_name, level='model').iloc[:, -12:]
    actual_df = dataframe.xs('actual', level='model').iloc[:, -12:]
    absolute_errors = []

    for col in predicted_dataframe.columns:
        predicted_col = predicted_dataframe[col]
        actual_col = actual_df[col]
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