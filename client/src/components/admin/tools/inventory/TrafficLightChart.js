import React from 'react';
import { Bar } from 'react-chartjs-2';

const TrafficLightChart = ({ data }) => {

  const dataFiltered = data.slice(0, -1)

  const labels = dataFiltered.map(item => item['Caracterización']);
  const counts = dataFiltered.map(item => item['Cantidad de productos']);
  const sumSales = dataFiltered.map(item => item['Suma venta diaria']);
  const sumStock = dataFiltered.map(item => item['Suma de stock']);

  // Creamos el objeto de datos para el gráfico
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Cantidad de productos',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        data: counts
      },
      {
        label: 'Suma venta diaria',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        data: sumSales
      },
      {
        label: 'Suma de stock',
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
        data: sumStock
      }
    ]
  };

  // Configuración del gráfico
  const options = {
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  };

  return (
    <div className='mt-5'>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TrafficLightChart;
