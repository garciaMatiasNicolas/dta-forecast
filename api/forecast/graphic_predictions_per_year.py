from collections import defaultdict
import pandas as pd


def graphic_predictions_per_year(data: dict, max_date) -> dict:
    actual_data = defaultdict(float)
    other_data = defaultdict(float)
    max_year = pd.to_datetime(max_date).year
    max_month = pd.to_datetime(max_date).month

    for key, value in data.items():
        for date, item_value in zip(value['x'], value['y']):
            year = pd.to_datetime(date).year
            month = pd.to_datetime(date).month

            if key == 'actual_data':
                actual_data[year] += item_value

            elif key == 'other_data':
                if year < max_year:
                    other_data[year] = 0

                elif year == max_year:
                    if month > max_month:
                        other_data[year] += item_value

                else:
                    other_data[year] += item_value

    actual_data = [{'x': year, 'y': value} for year, value in actual_data.items()]
    other_data = [{'x': year, 'y': value} for year, value in other_data.items()]

    actual_data.sort(key=lambda x: x['x'])
    other_data.sort(key=lambda x: x['x'])

    result = {
        "actual_data": {
            "x": [d['x'] for d in actual_data],
            "y": [d['y'] for d in actual_data]
        },
        "other_data": {
            "x": [d['x'] for d in other_data],
            "y": [d['y'] for d in other_data]
        }
    }

    return result
