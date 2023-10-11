from collections import defaultdict


def graphic_predictions_per_year(data: dict) -> dict:

    actual_data = defaultdict(float)
    other_data = defaultdict(float)

    for key, value in data.items():
        for date, item_value in zip(value['x'], value['y']):
            year = date.split('-')[0]
            if key == 'actual_data':
                actual_data[year] += item_value
            elif key == 'other_data':
                other_data[year] += item_value

    # Convert dict
    actual_data = [{'x': year, 'y': value} for year, value in actual_data.items()]
    other_data = [{'x': year, 'y': value} for year, value in other_data.items()]

    # Order lists per year
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
