from .models import HistoricalData
import pandas as pd
import os


# Function for read xlsx file and create sql_table
def save_dataframe(file_name: str, user: int, project: int):
    media_directory = "media"
    excel_directory = "excel_files"
    route = os.path.join(media_directory, excel_directory, file_name)
    dataframe = pd.read_excel(route)

    for index, row in dataframe.iterrows():
        historical_data = HistoricalData(
            Family=row['Family'],
            Region=row['Region'],
            Salesman=row['Salesman'],
            Client=row['Client'],
            Category=row['Category'],
            Subcategory=row['Subcategory'],
            SKU=row['SKU'],
            Description=row['Description'],
            StartingYear=row['Starting Year'],
            StartingPeriod=row['Starting Period'],
            PeriodsPerYear=row['Periods Per Year'],
            PeriodsPerCycle=row['Periods Per Cycle']
        )
        historical_data.save()


