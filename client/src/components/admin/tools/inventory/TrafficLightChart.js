import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

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

  // Configuración de los colores para cada sector
  const colors = [
    'rgba(255, 99, 132, 0.7)',  // Rojo
    'rgba(75, 192, 192, 0.7)',  // Verde azulado
    'rgba(255, 205, 86, 0.7)',  // Amarillo
    'rgba(54, 162, 235, 0.7)',  // Azul
    'rgba(153, 102, 255, 0.7)', // Morado
    'rgba(255, 159, 64, 0.7)',  // Naranja
    'rgba(101, 143, 255, 0.7)', // Azul cielo
    'rgba(233, 87, 63, 0.7)',   // Naranja rojizo
    'rgba(90, 209, 77, 0.7)'    // Verde
  ];

  // Preparar la estructura de datos para Highcharts
  const chartData = labels.map((label, index) => ({
    name: label,
    y: counts[index],
    color: colors[index % colors.length] // Círculo de colores si hay más categorías
  }));

  // Configuración del gráfico de torta con Highcharts
  const options = {
    chart: {
      type: 'pie',
      backgroundColor: null,
      height: 400,
    },
    title: {
      text: `${type} Distribution`,
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
        },
        showInLegend: true,
      },
    },
    series: [
      {
        name: type,
        colorByPoint: true,
        data: chartData,
      },
    ],
  };

  return (
    <HighchartsReact highcharts={Highcharts} options={options} />
  );
};

export default TrafficLightChart;
