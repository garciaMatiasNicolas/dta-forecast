import React from 'react';
import { Line } from 'react-chartjs-2';

const EmptyLineChart = () => {
  const data = {
    labels: [], // Etiquetas para el eje X (vacías inicialmente)
    datasets: [
      {
        data: [], // Datos para el eje Y (vacíos inicialmente)
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.4)',
        pointBorderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
      },
    ],
  };

  const options = {
    scales: {
      x: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Eje X',
          },
        },
      ],
      y: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Eje Y',
          },
        },
      ],
    },
  };

  return <Line data={data} options={options} />;
};

export default EmptyLineChart;
