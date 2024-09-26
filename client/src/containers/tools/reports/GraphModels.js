import React from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import EmptyLineChart from '../../../components/admin/tools/volume/EmptyChartLine';

const GraphMape = ({ scenario, graphicData }) => {
    // Verifica que graphicData.models y graphicData.avg sean arrays válidos
    const models = Array.isArray(graphicData.models) ? graphicData.models : [];
    const avg = Array.isArray(graphicData.avg) ? graphicData.avg : [];

    // Configuración de Highcharts para el gráfico de torta (pie chart)
    const options = {
        chart: {
            type: 'pie',
            height: '400px',
        },
        title: {
            text: 'Grafico Modelos',
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '{point.name}: {point.percentage:.1f} %',
                },
            },
        },
        series: [
            {
                name: 'Promedio',
                colorByPoint: true,
                data: models.map((model, index) => ({
                    name: model, // Etiqueta de la sección
                    y: avg[index], // Valor para la sección
                    color: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(153, 102, 255, 0.5)',
                        'rgba(255, 159, 64, 0.5)',
                    ][index % 6], // Color correspondiente (con % por si hay más de 6 modelos)
                })),
            },
        ],
        legend: {
            enabled: true,
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom',
        },
    };

    return (
        <div className='w-auto mt-5 d-flex justify-content-center align-items-center flex-column'>
            <p className="text-primary w-auto m-0 p-0">Grafico Modelos</p>
            <div style={{ width: '600px', height: '400px' }}>
                {scenario === 0 ? <EmptyLineChart /> : <HighchartsReact highcharts={Highcharts} options={options} />}
            </div>
        </div>
    );
};

export default GraphMape;

