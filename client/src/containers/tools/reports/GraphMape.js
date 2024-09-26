import React from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import EmptyLineChart from '../../../components/admin/tools/volume/EmptyChartLine';

const GraphMape = ({ errorName, scenario, graphicData }) => {
    const reversedX = Array.isArray(graphicData.x) ? graphicData.x.reverse() : [];
    const reversedY = Array.isArray(graphicData.y) ? graphicData.y.reverse() : [];

    // Configuración de Highcharts
    const options = {
        chart: {
            type: 'column', // Tipo de gráfico de barras (columnas verticales)
            height: '400px',
        },
        title: {
            text: `${errorName} por mes`,
        },
        xAxis: {
            categories: reversedX, // Etiquetas en el eje X (fechas)
            title: {
                text: 'Meses'
            },
        },
        yAxis: {
            title: {
                text: 'Valores'
            },
        },
        series: [
            {
                name: errorName,
                data: reversedY, // Datos en el eje Y
                color: 'rgba(53, 162, 235, 0.5)', // Color de las barras
            }
        ],
        legend: {
            enabled: true, // Mostrar la leyenda
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0,
            },
        },
        responsive: {
            rules: [
                {
                    condition: {
                        maxWidth: 500,
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom',
                        },
                    },
                },
            ],
        },
    };

    return (
        <div className='w-50 mt-5'>
            <p className="text-primary w-auto m-0 p-0">{errorName} último año</p>
            {scenario === 0 ? <EmptyLineChart /> : <HighchartsReact highcharts={Highcharts} options={options} />}
        </div>
    );
};

export default GraphMape;
