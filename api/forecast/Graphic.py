from collections import defaultdict
import pandas as pd
import numpy as np
import traceback


class Graphic:
    def __init__(self, file_path: str = None, max_date = None, pred_p: int = None, error_method: str = None, dataframe: pd.DataFrame = None):
        self.file_path = file_path
        self.max_date = max_date
        self.pred_p = pred_p
        self.error_method = error_method
        self.dataframe = dataframe

    def graphic_predictions(self):
        try:
            df_pred = self.dataframe

            max_date = pd.to_datetime(self.max_date)
            
            # Dropear la antepenúltima columna
            anteultima_columna = df_pred.columns[-2]
            df_pred = df_pred.drop(columns=[anteultima_columna])

            date_columns = df_pred.columns[9:-2]

            # Filtrar filas donde el modelo es 'actual' y las otras filas
            actual_rows = df_pred[df_pred['model'] == 'actual']
            other_rows = df_pred[df_pred['model'] != 'actual']

            # Rellenar valores NaN con 0.0 en las columnas de fechas
            actual_rows[date_columns] = actual_rows[date_columns].fillna(0.0)
            other_rows[date_columns] = other_rows[date_columns].fillna(0.0)

            # Filtrar las other_rows donde best_model == 1
            best_model_rows = other_rows[other_rows['best_model'] == 1]

            # Sumar los valores para 'actual_rows' y 'best_model_rows'
            actual_sum = actual_rows[date_columns].sum()
            best_model_sum = best_model_rows[date_columns].sum()

            # Dropear la columna 'best_model' después de sumar los valores
            best_model_rows = best_model_rows.drop(columns=['best_model'])

            # Preparar los datos para graficar
            actual_data = {'x': date_columns.tolist(), 'y': actual_sum.tolist()}

            # Ajustar las fechas y valores quitando los periodos predichos (pred_p)
            dates = actual_data['x'][:-self.pred_p]
            values = actual_data['y'][:-self.pred_p]

            actual_data['x'] = dates
            actual_data['y'] = values

            last_date = date_columns.tolist()
            last_best_model_sum = best_model_sum.tolist()

            # Preparar los datos de 'best_model_rows' para graficar
            other_data = {'x': last_date, 'y': last_best_model_sum}

            # Estructura final de datos
            final_data = {'actual_data': actual_data, 'other_data': other_data}
        

            # Procesar los datos por año
            data_per_year = self.graphic_predictions_per_year(data=final_data, max_date=max_date)

            return final_data, data_per_year
    
        except Exception as err:
            traceback.print_exc()
            print("Error en el grafico: ", err)

    @staticmethod
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
                            other_data[year] = 0

                    else:
                        other_data[year] += item_value

        actual_data = [{'x': year, 'y': value} for year, value in actual_data.items()]
        other_data = [{'x': year, 'y': value} for year, value in other_data.items()]

        actual_data.sort(key=lambda x: x['x'])
        other_data.sort(key=lambda x: x['x'])

        actual_data = [{'x': d['x'], 'y': round(d['y'], 2)} for d in actual_data]
        other_data = [{'x': d['x'], 'y': round(d['y'], 2)} for d in other_data]

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