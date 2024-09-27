import React from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { ClipLoader } from 'react-spinners'; // Importa el spinner

const EmptyLineChart = ({ loading }) => {
  const options = {
    title: {
      text: 'No hay datos para mostrar', // Título para mostrar cuando no hay datos
    },
    xAxis: {
      title: {
        text: 'Eje X',
      },
      categories: [], // Categorías vacías inicialmente
    },
    yAxis: {
      title: {
        text: 'Eje Y',
      },
    },
    series: [
      {
        name: 'Datos',
        data: [], // Datos vacíos inicialmente
      },
    ],
    lang: {
      noData: 'No data to display', // Texto que aparece cuando no hay datos
    },
    noData: {
      style: {
        fontWeight: 'bold',
        fontSize: '15px',
        color: '#303030',
      },
    },
  };

  return (
    <div style={{ position: 'relative', minHeight: '400px' }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
          }}
        >
          <ClipLoader size={50} color="#36d7b7" loading={loading} />
        </div>
      )}
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </div>
  );
};

export default EmptyLineChart;
