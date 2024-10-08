from typing import List, Dict, Any, Tuple
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from files.file_model import FileRefModel
from ..models import ForecastScenario
from database.db_engine import engine
from django.db import connection
import pandas as pd
import numpy as np
import math
from scipy.special import erfinv
from datetime import datetime, timedelta
from collections import defaultdict
import traceback
import locale
import math
import json

locale.setlocale(locale.LC_ALL, 'es_ES.utf8')

class StockDataView(APIView):

    # -- METHODS FOR GET DATA FROM DB -- #
    @staticmethod
    def get_data(project_pk: int, only_traffic_light: bool, is_drp = None, scenario: int = None, filter_name: str = None, filter_value: str = None):
        try:
            max_historical_date = ""
            if scenario:
                forecast_data = ForecastScenario.objects.get(pk=scenario)
                max_historical_date = forecast_data.max_historical_date.strftime('%Y-%m-%d')

                if forecast_data is None:
                    table_forecast = None

                else:
                    query = f"SELECT * FROM {forecast_data.predictions_table_name} WHERE model != 'actual' OR best_model = 1"
                    if only_traffic_light and filter_name and filter_value:
                        query += f" AND {filter_name} = '{filter_value}'"
                    
                    table_forecast = pd.read_sql_query(query, engine)
            
            else:
                table_forecast = None

            historical_data = FileRefModel.objects.filter(project_id=project_pk, model_type_id=1).first()
            if historical_data is None:
                raise ValueError("Historical_not_found")

            table_historical = pd.read_sql_table(table_name=historical_data.file_name, con=engine)

            stock_data = FileRefModel.objects.filter(project_id=project_pk, model_type_id=4).first()
            if stock_data is None:
                raise ValueError("Stock_data_not_found")

            table_stock = pd.read_sql_table(table_name=stock_data.file_name, con=engine)

            if only_traffic_light:
                table_historical = table_historical[table_historical[filter_name] == filter_value]
                table_stock = table_stock[table_stock[filter_name] == filter_value]
                # table_forecast = None

            tables = {"historical": table_historical, "stock": table_stock, "forecast": table_forecast}

            if is_drp is not None:
                regions_hsd = table_historical["Region"].unique()
                regions_stock = table_stock["Region"].unique()
                regions_forecast = table_stock["Region"].unique() if table_forecast is not None else [""]

                if regions_forecast[0] == "null" or regions_stock[0] == "null" or regions_hsd[0] == "null":
                    return "regions_null", ""
                

            return tables, max_historical_date
        
    
        except Exception as err:
            print("ERROR BUSQUEDA DATOS", err)

    # --- METHODS FOR CALCULATE STOCK --- #
    @staticmethod
    def calculate_avg_desv_varcoefficient(historical: pd.DataFrame, stock: pd.DataFrame, forecast_periods: int, historical_periods: int, forecast: pd.DataFrame, max_hsd: str):
        try:
            # Seleccionar las columnas de categorías
            category_columns = ['SKU', 'Description', 'Family', 'Region', 'Client', 'Salesman', 'Category', 'Subcategory']

            historical.fillna(0, inplace=True)
            stock.fillna(0, inplace=True)
            if forecast is not None:
                forecast.fillna(0, inplace=True)

            historical_results = []
            forecast_results = []

            # Calcular resultados históricos
            for idx, row in historical.iterrows():
                product_data = row[category_columns]
                historical_data = row.iloc[-historical_periods:]

                total_sales = historical_data.sum()
                avg_row = np.average(historical_data)
                avg_sales = round(avg_row / 30, 3)
                desv = round(historical_data.std(), 2)
                coefficient_of_variation = round(desv / avg_sales, 2) if avg_sales != 0 else 0
                stock_or_request = 'stock' if coefficient_of_variation > 0.7 else 'request'
                desv_2 = round(desv / 30, 2)

                row_with_stats = product_data.to_dict()
                row_with_stats.update({
                    'total_sales_historical': total_sales,
                    'avg_row_historical': str(avg_row) if not pd.isna(avg_row) else '0',
                    'desv_historical': str(desv) if not pd.isna(desv) else '0',
                    'coefficient_of_variation_historical': str(coefficient_of_variation) if not pd.isna(coefficient_of_variation) else '0',
                    'stock_or_request_historical': stock_or_request,
                    'avg_sales_per_day_historical': avg_sales,
                    'desv_per_day_historical': desv_2
                })
                historical_results.append(row_with_stats)

            historical_stats_df = pd.DataFrame(historical_results)
            historical_stats_df[category_columns] = historical[category_columns].astype(str)

            if forecast is not None:
                date_index = forecast.columns.get_loc(max_hsd)
                next_columns = forecast.columns[date_index+1:date_index+1+forecast_periods]
                forecast[category_columns] = forecast[category_columns].replace(0.0, 'null')

                # Calcular resultados de pronósticos
                for idx, row in forecast.iterrows():
                    product_data = row[category_columns]
                    forecast_data = row[next_columns]

                    total_sales_forecast = forecast_data.sum()
                    avg_row_forecast = np.average(forecast_data)
                    avg_sales_forecast = round(avg_row_forecast / 30, 3)
                    desv_forecast = round(forecast_data.std(), 2)
                    coefficient_of_variation_forecast = round(desv_forecast / avg_sales_forecast, 2) if avg_sales_forecast != 0 else 0
                    stock_or_request_forecast = 'stock' if coefficient_of_variation_forecast > 0.7 else 'request'
                    desv_2_forecast = round(desv_forecast / 30, 2)

                    row_with_stats_forecast = product_data.to_dict()
                    row_with_stats_forecast.update({
                        'total_sales_forecast': total_sales_forecast,
                        'avg_row_forecast': str(avg_row_forecast) if not pd.isna(avg_row_forecast) else '0',
                        'desv_forecast': str(desv_forecast) if not pd.isna(desv_forecast) else '0',
                        'coefficient_of_variation_forecast': str(coefficient_of_variation_forecast) if not pd.isna(coefficient_of_variation_forecast) else '0',
                        'stock_or_request_forecast': stock_or_request_forecast,
                        'avg_sales_per_day_forecast': avg_sales_forecast,
                        'desv_per_day_forecast': desv_2_forecast
                    })
                    forecast_results.append(row_with_stats_forecast)

                forecast_stats_df = pd.DataFrame(forecast_results)
                forecast_stats_df[category_columns] = forecast[category_columns].astype(str)
              
                for col in category_columns:
                    forecast_stats_df[col] = forecast_stats_df[col].apply(lambda x: "null" if x == 0.0 or x == 0 else x)

                # Unir los resultados históricos y de pronósticos en una sola línea por producto
                combined_df = pd.merge(historical_stats_df, forecast_stats_df, on=category_columns, suffixes=('_historical', '_forecast'), how='outer')
            
            else:
                for col in ['total_sales_forecast', 'avg_row_forecast', 'desv_forecast', 'coefficient_of_variation_forecast', 'stock_or_request_forecast', 'avg_sales_per_day_forecast', 'desv_per_day_forecast']:
                    historical_stats_df[col] = 0.0 if 'stock_or_request_forecast' != col else 'request'

                combined_df = historical_stats_df
            
            stock[category_columns] = stock[category_columns].astype(str)

            # Combinar con stock
            result_df = pd.merge(combined_df, stock, on=category_columns, how='outer', indicator=True)

            # Convertir la columna '_merge' a categórica
            result_df['_merge'] = result_df['_merge'].astype('str')

            # Rellenar los valores 'NaN' con 0 después de convertir la columna '_merge' a categórica
            result_df.fillna(0, inplace=True)

            # Eliminar duplicados si existen
            result_df = result_df.drop_duplicates(subset=category_columns)

            result_list = result_df.to_dict(orient='records')
            return result_list

        except Exception as err:
            print("ERROR CALCULOS", err)
            traceback.print_exc()

    @staticmethod
    def calculate_abc_per_category(products_df: pd.DataFrame, is_forecast: bool):
        try:
            products_df['Precio unitario'] = products_df['Precio unitario'].apply(lambda num: int(num.replace('.', '')))
        
            # Calcular el 'Valor Anual' por categoría
            products_df['Valor Anual'] = products_df[f'Venta diaria {"predecido" if is_forecast else "histórico"}'] * products_df['Precio unitario']
            
            # Agrupar por categoría y ordenar cada grupo por 'Valor Anual'
            products_df = products_df.groupby('Categoria').apply(lambda x: x.sort_values('Valor Anual', ascending=False)).reset_index(drop=True)
            
            # Calcular el 'Valor Acumulado' por categoría
            products_df['Valor Acumulado'] = products_df.groupby('Categoria')['Valor Anual'].cumsum()
            
            # Calcular el '% Acumulado' por categoría y restablecer el índice para evitar conflictos
            products_df['% Acumulado'] = products_df.groupby('Categoria')['Valor Acumulado'].apply(lambda x: round((x / x.iloc[-1]) * 100, 2)).reset_index(drop=True)
            
            # Asignar etiquetas ABC basadas en el '% Acumulado' por categoría
            products_df['ABC en $ por Categoria'] = pd.cut(products_df['% Acumulado'], bins=[0, 80, 95, 100], labels=['A', 'B', 'C'])
            
            # Eliminar las columnas temporales utilizadas para los cálculos
            products_df.drop(columns=["Valor Acumulado", "% Acumulado", "Valor Anual"], inplace=True)
            products_df.fillna('C', inplace=True)
            return products_df.to_dict(orient='records')
        
        except Exception as err:
            traceback.print_exc()
            print("ERROR ABC POR CATEGORÍA", err)

    def calculate_abc(self, products_df: pd.DataFrame, is_forecast: bool):
        try:
            products_df['Valor Anual'] = products_df[f'Venta diaria {"predecido" if is_forecast else "histórico"}'] * products_df['Precio unitario'].apply(lambda num: int(num.replace('.', '')))
            
            products_df = products_df.sort_values('Valor Anual', ascending=False)
            
            products_df['Valor Acumulado'] = round(products_df['Valor Anual'].cumsum(), 2)
            products_df['% Acumulado'] = round((products_df['Valor Acumulado'] / products_df['Valor Anual'].sum()) * 100, 2)

            products_df['ABC en $ Total'] = pd.cut(products_df['% Acumulado'], bins=[0, 80, 95, 100], labels=['A', 'B', 'C'])
            products_df.drop(columns=["Valor Acumulado", "% Acumulado", "Valor Anual"], inplace=True)

            products = self.calculate_abc_per_category(products_df=products_df, is_forecast=is_forecast)
            return products
        
        except Exception as err:
            traceback.print_exc()
            print("ERROR ABC TOTAL", err)
    
    @staticmethod
    def calculate_optimal_batch(c, d, k):
        c = c if c >= 0 else 0 * 360
        d = int(d)/100
        k = float(f'0.{k}')
        EOQ = math.sqrt((2 * c * d) / k)
        return EOQ

    def calculate_stock(self, data: List[Dict[str, Any]], next_buy_days: int, is_forecast: bool, d, k) -> (
            tuple)[list[dict[str | Any, int | str | datetime | Any]], bool]:
        try:
            def verify_safety_stock_zero(array: List[Dict[str, Any]]):
                for product in array:
                    if product.get("Safety Stock", 0) != 0:
                        return False

                return True
            
            def round_up(n, dec):
                factor = n / dec
                factor = round(factor)
                return factor * dec

            safety_stock_is_zero = verify_safety_stock_zero(data)

            results = []

            for item in data:
                avg_sales_historical = float(item["avg_sales_per_day_historical"])
                cost_price = float(item["Cost Price"])
                price = float(item['Price'])
                avg_sales_forecast = float(item["avg_sales_per_day_forecast"]) 
                purchase_order = float(item['Purchase Order'])
                avg_sales = float(item[f'avg_sales_per_day_{"forecast" if is_forecast else "historical"}'])
                stock = float(item["Stock"])
                available_stock = float(item['Stock']) - float(item['Sales Order Pending Deliverys']) + purchase_order
                lead_time = float(item['Lead Time'])
                safety_stock = float(item['Safety stock (days)'])
                reorder_point = next_buy_days + lead_time + safety_stock
                days_of_coverage = round(available_stock / avg_sales) if avg_sales != 0 else 9999
                buy = 'Si' if (days_of_coverage - reorder_point) < 1 else 'No'
                optimal_batch = float(item["EOQ (Economical order quantity)"])
                overflow_units = stock if avg_sales == 0 else (0 if (stock / avg_sales) - reorder_point < 0 else round((stock / avg_sales - reorder_point)*avg_sales)) 
                overflow_price = round(overflow_units*cost_price)
                lot_sizing = float(item['Lot Sizing'])
                sales_order = float(item['Sales Order Pending Deliverys'])
                is_obs = str(item['Slow moving'])
                purchase_unit = float(item['Purchase unit'])
                make_to_order = str(item['Make to order'])
                merge = str(item['_merge'])
                
                try:
                    next_buy = datetime.now() + timedelta(days=days_of_coverage - lead_time) if days_of_coverage != 0 \
                        else datetime.now()

                except OverflowError:
                    next_buy = ""
                

                if days_of_coverage == 9999:

                    stock_status = "Obsoleto"
                    if available_stock != 0:
                        characterization = "0-Con stock sin ventas"
                    else:
                        characterization = "Sin stock"

                elif days_of_coverage > 360:
                    stock_status = 'Alto sobrestock'
                    characterization = "1-Más de 360 días"

                elif days_of_coverage > 180:
                    stock_status = 'Sobrestock'
                    characterization = "2-Entre 180 y 360"
                    
                elif days_of_coverage > 30:

                    stock_status = 'Normal'
                    if days_of_coverage > 90:
                        characterization = "3-Entre 90 y 180"
                    else:
                        characterization = "4-Entre 30 y 90"

                elif days_of_coverage > 15:
                    stock_status = 'Riesgo quiebre'
                    characterization = "5-Entre 15 y 30"

                elif days_of_coverage >= 0:
                    stock_status = "Quiebre"
                    characterization = "6-Menos de 15"
                
                else:
                    stock_status = 'Stock negativo'
                    
                    if available_stock != 0:
                        characterization = "0-Con stock sin ventas"
                    else:
                        characterization = "Sin stock"

    
                next_buy = next_buy.strftime('%Y-%m-%d') if isinstance(next_buy, datetime) else next_buy
                final_buy = ('Si' if available_stock - sales_order + purchase_order < 0 else 'No') if make_to_order == 'MTO' else buy
                
                if final_buy == "Si":
                    
                    if is_obs == 'OB':
                        # Cuanto
                        how_much = 0
                        # Cuanto Lot Sizing 
                        how_much_vs_lot_sizing = 0
                        # Cuanto Purchase Unit
                        how_much_purchase_unit = 0
                    
                    else:
                        # Cuanto
                        if make_to_order == "MTO":
                            how_much = abs(available_stock) if available_stock < 0 else 0
                        
                        else: 
                            how_much = max(optimal_batch, (next_buy_days + lead_time + safety_stock - days_of_coverage) * avg_sales )

                        # Cuanto lot sizing
                        how_much_vs_lot_sizing = round_up(how_much, int(lot_sizing)) if int(lot_sizing) != 0.0 else how_much
                        how_much_vs_lot_sizing = max(how_much_vs_lot_sizing, optimal_batch)

                        if make_to_order == "MTO":
                            how_much_vs_lot_sizing = abs(available_stock) if available_stock < 0 else 0
                        
                        else: 
                            how_much_vs_lot_sizing = round(how_much_vs_lot_sizing)
                        
                        # Cuanto purchase unit
                        how_much_purchase_unit = round(how_much_vs_lot_sizing * purchase_unit)
                
                else:
                    # Cuanto
                    how_much = 0
                    # Cuanto Lot Sizing 
                    how_much_vs_lot_sizing = 0
                    # Cuanto Purchase Unit
                    how_much_purchase_unit = 0
                
                valued_cost = round(cost_price*how_much_vs_lot_sizing,2)

                optimal_batch_calc = self.calculate_optimal_batch(c=avg_sales, d=d, k=k)
                
                try:
                    thirty_days = days_of_coverage - 30 + round(how_much) / avg_sales
                    
                    if thirty_days < reorder_point:
                        thirty_days = avg_sales * 30
                    
                    else:
                        thirty_days = 0

                except:
                    thirty_days = 0
                
                try:
                    sixty_days = days_of_coverage - 60 + round(how_much) / avg_sales + thirty_days / avg_sales 
                    
                    if sixty_days < reorder_point:
                       sixty_days = avg_sales * 30
                    
                    else:
                        sixty_days = 0
                
                except:
                    sixty_days = 0

                try:
                    ninety_days = days_of_coverage - 90 + round(how_much) / avg_sales + thirty_days / avg_sales + sixty_days / avg_sales

                    if ninety_days < reorder_point:
                       ninety_days = avg_sales * 30
                    
                    else:
                        ninety_days = 0
                
                except:
                    ninety_days = 0

                try:
                    drp_lead_time = float(item["DRP lead time"])
                    drp_safety_stock = float(item["DRP safety stock (days)"])
                    drp_lot_sizing =  float(item["DRP Lot sizing"])
                
                except KeyError:
                    drp_lead_time = "Falta de subir en Stock data"
                    drp_safety_stock = "Falta de subir en Stock data"
                    drp_lot_sizing =  "Falta de subir en Stock data"

                stock = {
                    'Familia': item['Family'],
                    'Categoria': item['Category'],
                    'Vendedor': item['Salesman'],
                    'Subcategoria': item['Subcategory'],
                    'Cliente': item['Client'],
                    'Región': item['Region'],
                    'SKU': str(item['SKU']),
                    'Descripción': str(item['Description']),
                    'Stock': locale.format_string("%d", int(round(stock)), grouping=True),
                    'Stock disponible': locale.format_string("%d", int(round(available_stock)), grouping=True),
                    'Lote mínimo de compra': optimal_batch,
                    'Ordenes de venta pendientes': sales_order,
                    'Ordenes de compra': purchase_order,
                    'Venta diaria histórico': avg_sales_historical,
                    'Venta diaria predecido': avg_sales_forecast,
                    'Cobertura (días)': str(days_of_coverage),
                    'Punto de reorden': str(reorder_point),
                    '¿Compro?': str(final_buy) if is_obs != 'OB' else 'No',
                    '¿Cuanto?': locale.format_string("%d", round(how_much), grouping=True) ,
                    '¿Cuanto? (Lot Sizing)': locale.format_string("%d", round(how_much_vs_lot_sizing), grouping=True),
                    '¿Cuanto? (Purchase Unit)': locale.format_string("%d", how_much_purchase_unit, grouping=True),
                    'Compra 30 días':  0 if make_to_order == "MTO" or is_obs == "OB" else locale.format_string("%d",thirty_days, grouping=True),
                    'Compra 60 días' : 0 if make_to_order == "MTO" or is_obs == "OB" else locale.format_string("%d",sixty_days, grouping=True),
                    'Compra 90 días': 0 if make_to_order == "MTO" or is_obs == "OB" else locale.format_string("%d",ninety_days, grouping=True),
                    'Estado': str(stock_status),
                    'Cobertura prox. compra (días)': str(days_of_coverage - next_buy_days),
                    'Stock seguridad en dias': str(safety_stock),
                    'Unidad de compra': purchase_unit,
                    'Lote de compra': lot_sizing,
                    'EOQ (Calculado)': locale.format_string("%d",optimal_batch_calc, grouping=True),
                    'Precio unitario': locale.format_string("%d",round(price),grouping=True),
                    "Costo del producto": locale.format_string("%d",round(cost_price),grouping=True),
                    'MTO': make_to_order if make_to_order == 'MTO' else '',
                    'OB': is_obs if is_obs == 'OB' else '',
                    'XYZ': item['XYZ'],
                    'ABC Cliente': item['ABC'],
                    'Sobrante valorizado': locale.format_string("%d", int(round(overflow_price)), grouping=True),
                    'Demora en dias (DRP)': drp_lead_time,
                    'Stock de seguridad (DRP)': drp_safety_stock,
                    'Lote de compra (DRP)': drp_lot_sizing,
                    'Compra Valorizada': locale.format_string("%d", valued_cost, grouping=True) if buy == 'Si' and is_obs != 'OB' else "0",
                    'Venta valorizada': locale.format_string("%d", int(round(price * avg_sales)), grouping=True),
                    'Valorizado': locale.format_string("%d", int(round(cost_price * stock)), grouping=True),
                    'Demora en dias': str(lead_time),
                    'Fecha próx. compra': str(next_buy) if days_of_coverage != 9999 else "---",
                    'Caracterización': characterization if merge == 'both' else ('No encontrado en Stock Data' if merge == 'left_only' else 'No encontrado en Historical Data'),
                    'Sobrante (unidades)': locale.format_string("%d", overflow_units, grouping=True),
                }

                results.append(stock)
            
            # print(results)
        
            return results, safety_stock_is_zero
        except Exception as err:
            print("ERROR CALCULO REAPRO", err)
            traceback.print_exc()

    @staticmethod
    def calculate_safety_stock(data: List[Dict[str, Any]]):
        try:
            final_data = []
            for product in data:
                avg_sales_per_day = float(product['avg_sales_per_day_historical'])
                desv_per_day = float(product['desv_per_day_historical'])
                lead_time = float(product['Lead Time'])
                service_level = float(product['Service Level']) / 100
                desv_est_lt_days = float(product['Desv Est Lt Days'])
                service_level_factor = round(erfinv(2 * service_level - 1) * 2**0.5, 2)
                desv_comb = round(((lead_time * desv_per_day * desv_per_day) + (avg_sales_per_day * avg_sales_per_day* desv_est_lt_days * desv_est_lt_days)) ** 0.5, 2)

                safety_stock_units = round(service_level_factor * desv_comb, 2)
                reorder_point = round(lead_time * avg_sales_per_day + safety_stock_units, 2)
                safety_stock_days = round(safety_stock_units / avg_sales_per_day, 2) if avg_sales_per_day != 0 else 0

                safety_stock = {
                    'Familia': str(product['Family']),
                    'Categoria': str(product['Category']),
                    'Vendedor': str(product['Salesman']),
                    'Subcategoria': str(product['Subcategory']),
                    'Cliente': (product['Client']),
                    'Región': str(product['Region']),
                    'SKU': str(product['SKU']),
                    'Descripción': str(product['Description']),
                    'Promedio': str(avg_sales_per_day),
                    'Desviacion': str(desv_per_day),
                    'Coeficiente desviacion': str(round(float(avg_sales_per_day) / float(desv_per_day), 2)) if float(desv_per_day) != 0 else 0,
                    'Tiempo demora': str(lead_time),
                    'Variabilidad demora': str(desv_est_lt_days),
                    'Nivel servicio': str(service_level),
                    'Factor Nivel Servicio': str(service_level_factor),
                    'Desviacion combinada': str(desv_comb),
                    'Punto reorden': str(reorder_point),
                    'Stock Seguridad (días)': str(safety_stock_days),
                    'Stock Seguridad (unidad)': str(safety_stock_units)
                }

                final_data.append(safety_stock)

            return final_data
        except Exception as err:
            print("ERROR EN CALCULO STOCK SEGURIDAD", err)

    @staticmethod
    def traffic_light(products):
        try:
            count_articles = defaultdict(int)
            sum_sales = defaultdict(float)
            sum_stock = defaultdict(float)
            sum_valued_sales = defaultdict(int)
            sum_valued_stock = defaultdict(int)
            sum_overflow = defaultdict(int)

            for product in products:
                avg_sales =  product["Venta diaria histórico"]
                caracterizacion = product["Caracterización"]
                count_articles[caracterizacion] += 1
                sum_sales[caracterizacion] += float(avg_sales)
                sum_stock[caracterizacion] += float(product["Stock"])
                sum_valued_sales[caracterizacion] += int(locale.atof(product["Venta valorizada"]))
                sum_valued_stock[caracterizacion] += int(locale.atof(product["Valorizado"]))
                sum_overflow[caracterizacion] += int(locale.atof(product["Sobrante valorizado"]))  

            result = [
                {
                    "Caracterización": key, 
                    "Cantidad de productos": locale.format_string("%d", count_articles[key], grouping=True),
                    "Suma venta diaria": locale.format_string("%d",round(sum_sales[key], 2), grouping=True), 
                    "Suma de stock": locale.format_string("%d",round(sum_stock[key], 2), grouping=True), 
                    "Venta valorizada": locale.format_string("%d",round(sum_valued_sales[key]), grouping=True), 
                    "Stock valorizado": locale.format_string("%d",round(sum_valued_stock[key]), grouping=True),
                    "Sobrante valorizado": locale.format_string("%d",round(sum_overflow[key]), grouping=True),
                }
                for key in count_articles
            ]

            total_count_articles = sum(count_articles.values())
            total_sum_sales = sum(sum_sales.values())
            total_sum_stock = sum(sum_stock.values())
            total_valued_sales = sum(sum_valued_sales.values())
            total_valued_stock = sum(sum_valued_stock.values())
            total_overflow = sum(sum_overflow.values())

            result.append({
                "Caracterización": "Suma total", 
                "Cantidad de productos": locale.format_string("%d", total_count_articles, grouping=True),
                "Suma venta diaria": locale.format_string("%d", round(total_sum_sales, 2), grouping=True), 
                "Suma de stock": locale.format_string("%d",round(total_sum_stock, 2), grouping=True), 
                "Venta valorizada": locale.format_string("%d", round(total_valued_sales, 2), grouping=True),
                "Stock valorizado": locale.format_string("%d", round(total_valued_stock, 2), grouping=True),
                "Sobrante valorizado": locale.format_string("%d", round(total_overflow, 2), grouping=True)
            })

            sorted_results = sorted(result, key=lambda item: item["Caracterización"])

            return sorted_results
        except Exception as err:
            print("ERROR EN SEMÁFORO", err)
    
    @staticmethod
    def calculate_drp(products: list, is_forecast: bool):
        try:
            def round_up(n, dec):
                factor = n / dec
                factor = round(factor)
                return factor * dec
            
            available_stock = 0
            avg_sales_per_day = 0

            coverage_by_sku_region = {}
        
            # Llenar el diccionario con los datos de cobertura y stock disponible
            for product in products:
                sku = product['SKU']
                available_stock += float(product["Stock disponible"])
                avg_sales_per_day += float(product[f"Venta diaria {'predecido' if is_forecast else 'histórico'}"])
                region = product['Región']
                coverage = int(product['Cobertura (días)'])
                
                if sku not in coverage_by_sku_region:
                    coverage_by_sku_region[sku] = {}

                coverage_by_sku_region[sku][region] = {
                    "cobertura": coverage,
                    "stock_disponible": float(product["Stock disponible"])
                }
            
            # Transformar la lista de productos
            transformed_products = []
            for product in products:
                sku = product['SKU']
                region = product['Región']
                
                # Crear un nuevo producto con la cobertura disponible en otras regiones
                new_product = product.copy()
                for reg in coverage_by_sku_region[sku]:
                    new_product[f"Cobertura en {reg}"] = coverage_by_sku_region[sku][reg]["cobertura"]
                    new_product[f"Stock disponible en {reg}"] = coverage_by_sku_region[sku][reg]["stock_disponible"]
                
                transformed_products.append(new_product)
            
            for product in transformed_products:
                reorder_point_drp =  int(round(product["Stock de seguridad (DRP)"])) + int(round(product["Demora en dias (DRP)"]))
                replenish = "Si" if int(product["Cobertura (días)"]) < reorder_point_drp else "No"
                how_much_drp = 0 if replenish == "No" else float(product[f"Venta diaria {'predecido' if is_forecast else 'histórico'}"]) * 15

                product["Cobertura Total"] = int(round(available_stock / avg_sales_per_day))
                product["Punto de reorden (DRP)"] = reorder_point_drp
                product["¿Repongo?"] = replenish
                product["¿Cuanto repongo?"] = 0 if replenish == "No" else round_up(how_much_drp, product["Lote de compra (DRP)"]) 
                
                if replenish == "Si":
                    # Regiones con cobertura mayor al punto de reorden
                    regions_with_sufficient_coverage = {reg: coverage_by_sku_region[product['SKU']][reg]['cobertura']
                                                        for reg in coverage_by_sku_region[product['SKU']]
                                                        if coverage_by_sku_region[product['SKU']][reg]['cobertura'] >= reorder_point_drp}
                    
                    if len(regions_with_sufficient_coverage) == 0:
                        # Ninguna región tiene suficiente cobertura, hay que comprar
                        product["Distribuir desde"] = "Comprar"
                    elif len(regions_with_sufficient_coverage) == 1:
                        # Solo una región tiene suficiente cobertura
                        product["Distribuir desde"] = next(iter(regions_with_sufficient_coverage))  # Obtener la única región
                    else:
                        # Varias regiones tienen suficiente cobertura, elegir la región con mayor cobertura
                        product["Distribuir desde"] = max(regions_with_sufficient_coverage, key=regions_with_sufficient_coverage.get)
                    
                else:
                    product["Distribuir desde"] = "No repone"
            
            return transformed_products
        
        except Exception as e:
            print(f"Error en el cálculo del DRP: {e}")
            return []

            

    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):
        project_pk = request.data.get('project_id')
        type_of_stock = request.data.get('type')
        params = request.data.get('params')
        historical_periods = int(params["historical_periods"])
        is_forecast = True if params["forecast_or_historical"] == "forecast" else False
        forecast_periods = int(params["forecast_periods"])
        scenario = int(params["scenario_id"]) if params["scenario_id"] is not False or params["scenario_id"] else False
        only_traffic_light = request.GET.get('only_traffic_light', None)
        filter_name = request.GET.get('filter_name', None)
        filter_value = request.GET.get('filter_value', None)
        purchase_cost = params['purchase_cost']
        pruchase_perc = params['purchase_perc']
        drp = request.GET.get('drp', None)

        try:
            traffic_light = ""
            safety_stock_is_zero = False

            if only_traffic_light == "true":
                tables, max_historical_date = self.get_data(project_pk=project_pk, scenario=scenario, only_traffic_light=True, is_drp=drp, filter_name=filter_name, filter_value=filter_value)
            
            else:
                tables, max_historical_date = self.get_data(project_pk=project_pk, is_drp=drp, scenario=scenario, only_traffic_light=False)
            
            if tables == "regions_null":
                return Response(data={"error": "regions_null"}, status=status.HTTP_400_BAD_REQUEST)

            data = self.calculate_avg_desv_varcoefficient(historical=tables["historical"], stock=tables["stock"], forecast=tables["forecast"], 
            forecast_periods=forecast_periods, historical_periods=historical_periods, max_hsd=max_historical_date)

            if type_of_stock == 'stock by product':
                final_data, safety_stock = self.calculate_stock(data=data, next_buy_days=int(params["next_buy"]), is_forecast=is_forecast, d=purchase_cost, k=pruchase_perc)
                safety_stock_is_zero = safety_stock
                traffic_light = self.traffic_light(products=final_data)
                
                final_data_df = pd.DataFrame(final_data)
                final_data = self.calculate_abc(products_df=final_data_df, is_forecast=is_forecast)

                if drp == "true":
                    drp_products = self.calculate_drp(products=final_data, is_forecast=is_forecast)
                    return Response(data={"data": drp_products, "is_zero": False, "traffic_light": []}, status=status.HTTP_200_OK)

            if type_of_stock == 'safety stock':
                final_data = self.calculate_safety_stock(data=data)

            if only_traffic_light == "true":
                return Response(data={"traffic_light": traffic_light},
                status=status.HTTP_200_OK)
            
            else:
                return Response(data={"data": final_data, "is_zero": safety_stock_is_zero, "traffic_light": traffic_light},
                status=status.HTTP_200_OK)

        except ValueError as err:
            if str(err) == 'Historical_not_found':
                return Response(data={'error': 'data_none'}, status=status.HTTP_400_BAD_REQUEST)
            
            if str(err) == 'Stock_data_not_found':
                return Response(data={'error': 'stock_data_none'}, status=status.HTTP_400_BAD_REQUEST)

            else:
                print(str(err))
                traceback.print_exc()
                return Response(data={'error': str(err)}, status=status.HTTP_400_BAD_REQUEST)


class StockByProduct(APIView):
    @staticmethod
    def calculate_stock_by_product(forecast_table: pd.DataFrame, stock_data: pd.DataFrame, max_date: str, sku: str):
        # Filter tables by SKU
        forecast = forecast_table.loc[(forecast_table['sku'] == sku) & (forecast_table['model'] != 'actual')]
        rows = forecast.shape[0]
        if rows == 0:
            raise ValueError("SKU not found")

        if rows != 1:
            raise ValueError("More than one product with the same SKU")

        stock = stock_data.loc[stock_data['SKU'] == sku]

        # Get indexes
        max_date_index = forecast_table.columns.get_loc(key=max_date)
        val_last_date_historical = forecast[max_date].values

        # Merge dataframes
        forecast = forecast.iloc[:, max_date_index + 1:]
        dates = forecast.columns.tolist()
        stock = stock.iloc[:, 8:]

        # Get stock data
        available_stock = float(stock['Available Stock'].values)
        safety_stock = float(stock['safety stock'].values)
        purchase_order = float(stock['Purchase order'].values)

        # Calculate
        sales = [round(value, 2) for value in forecast.values.tolist()[0]]
        stock = [available_stock]

        for sale in sales:
            stock_val = round(available_stock - sale - safety_stock + purchase_order, 2)
            stock.append(stock_val)
            available_stock = stock_val
            purchase_order = 0
            safety_stock = 0

        dates.insert(0, max_date)
        sales.insert(0, val_last_date_historical[0])
        return {'sales': sales[:-1], 'stock': stock[:-1], 'dates': dates[:-1]}

    @staticmethod
    def obtain_stock_data(project: int) -> pd.DataFrame | None:
        stock_data = FileRefModel.objects.filter(project_id=project, model_type_id=4).first()

        if stock_data is not None:
            table = pd.read_sql_table(table_name=stock_data.file_name, con=engine)
            return table
        else:
            return None

    @staticmethod
    def obtain_forecast_data_table(scenario: int) -> pd.DataFrame | None:
        forecast_data = ForecastScenario.objects.get(pk=scenario)

        if forecast_data is not None:
            table = pd.read_sql_table(table_name=forecast_data.predictions_table_name, con=engine)
            return table
        else:
            return None

    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def get(self, request):
        project_id = request.query_params.get('project_id')

        if project_id:
            stock_data = self.obtain_stock_data(project=project_id)
            if stock_data is not None:
                return Response(data={'message': 'stock_data_uploaded'}, status=status.HTTP_200_OK)

            else:
                return Response(data={'error': 'stock_data_not_found'}, status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response(data={'error': 'project_id_not_provided'}, status=status.HTTP_400_BAD_REQUEST)

    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):
        scenario_id = request.data.get('scenario_id')
        project_id = request.data.get('project_id')
        sku = request.data.get('sku')

        forecast = self.obtain_forecast_data_table(scenario=scenario_id)
        stock = self.obtain_stock_data(project=project_id)

        if forecast is not None:

            if stock is not None:
                scenario = ForecastScenario.objects.get(pk=scenario_id)
                max_historical_date = scenario.max_historical_date.strftime('%Y-%m-%d')

                try:
                    stock_by_product = self.calculate_stock_by_product(forecast_table=forecast,
                                                                       stock_data=stock,
                                                                       max_date=max_historical_date,
                                                                       sku=sku)

                    return Response(data={'data': stock_by_product}, status=status.HTTP_200_OK)

                except ValueError as err:
                    if str(err) == "SKU not found":
                        return Response(data={'error': 'sku_not_found'}, status=status.HTTP_400_BAD_REQUEST)

                    elif str(err) == "More than one product with the same SKU":
                        return Response(data={'error': 'multiple_products_with_the_same_sku'},
                                        status=status.HTTP_400_BAD_REQUEST)

            else:
                return Response(data={'error': 'stock_data_not_found'}, status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response(data={'error': 'historical_data_not_found'}, status=status.HTTP_400_BAD_REQUEST)


