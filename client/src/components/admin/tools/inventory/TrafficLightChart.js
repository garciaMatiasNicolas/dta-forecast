import React from 'react';
import { Pie } from 'react-chartjs-2';

const TrafficLightChart = ({ data, isOnlyTL, type }) => {
  let dataFiltered = data;

  if (!isOnlyTL) {
    dataFiltered = data.slice(0, -1);  
  }
  
  const labels = dataFiltered.map(item => item['Caracterización']);
  const counts = dataFiltered.map(item => {
    const value = parseInt(item[type].replace(/\./g, ''));
    return isNaN(value) ? 0 : value;
  });
  
  // Creamos el objeto de datos para el gráfico de torta
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: type,
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',  // Rojo
          'rgba(75, 192, 192, 0.7)',  // Verde azulado
          'rgba(255, 205, 86, 0.7)',  // Amarillo
          'rgba(54, 162, 235, 0.7)',  // Azul
          'rgba(153, 102, 255, 0.7)', // Morado
          'rgba(255, 159, 64, 0.7)',  // Naranja
          'rgba(101, 143, 255, 0.7)', // Azul cielo
          'rgba(233, 87, 63, 0.7)',   // Naranja rojizo
          'rgba(90, 209, 77, 0.7)'    // Verde
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',   // Rojo
          'rgba(75, 192, 192, 1)',   // Verde azulado
          'rgba(255, 205, 86, 1)',   // Amarillo
          'rgba(54, 162, 235, 1)',   // Azul
          'rgba(153, 102, 255, 1)',  // Morado
          'rgba(255, 159, 64, 1)',   // Naranja
          'rgba(101, 143, 255, 1)',  // Azul cielo
          'rgba(233, 87, 63, 1)',    // Naranja rojizo
          'rgba(90, 209, 77, 1)'     // Verde
        ],
        borderWidth: 1,
        data: counts
      }
    ]
  };
  
  // Configuración del gráfico de torta
  const options = {
    responsive: true,
    maintainAspectRatio: false
  };

  return (

    <Pie data={chartData} options={options} />

  );
};

export default TrafficLightChart;
