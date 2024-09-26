import React, { useState, useRef } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import ClipLoader from 'react-spinners/ClipLoader';
import { MDBIcon } from 'mdb-react-ui-kit';

const ModelsGraphicByProduct = ({ data, productChanged }) => {
    const [allSeriesVisible, setAllSeriesVisible] = useState(true); // Estado para la visibilidad de las series
    const chartRef = useRef(null); // Referencia para el gráfico

    if (productChanged) {
        // Mostrar un mensaje de carga mientras los datos están siendo procesados
        return <div><ClipLoader /></div>;
    }

    if (!data || Object.keys(data).length === 0) {
        return <div></div>;
    }

    // Función para alternar la visibilidad de todas las series
    const toggleAllSeries = () => {
        const chart = chartRef.current.chart;
        chart.series.forEach((series) => {
            series.setVisible(!allSeriesVisible, false); // Cambia la visibilidad sin redibujar
        });
        chart.redraw(); // Redibuja el gráfico
        setAllSeriesVisible(!allSeriesVisible); // Actualiza el estado
    };

    // Configuración de Highcharts
    const options = {
        title: {
            text: 'Gráfico de Modelos por Producto'
        },
        xAxis: {
            categories: data.labels, // Etiquetas de fechas
            title: {
                text: 'Fecha'
            }
        },
        yAxis: {
            title: {
                text: 'Valores'
            }
        },
        series: data.datasets.map((dataset) => ({
            name: dataset.label,
            data: dataset.data,
            color: dataset.borderColor,
            type: 'line',  // Tipo de gráfico: línea
            lineWidth: 3,
            marker: {
                radius: 2.5 // Tamaño de los puntos en las líneas
            }
        })),
        chart: {
            zoomType: 'x',
            height: "600px"  // Habilitar el zoom en el eje x
        },
        tooltip: {
            shared: true,
            crosshairs: true,
            valueDecimals: 2,
        },
        legend: {
            align: 'right',
            verticalAlign: 'top',
            layout: 'vertical',
            x: 0,
            y: 100
        },
    };

    return (
        <div className='w-100 position-relative'>
            <div style={{ position: 'absolute', top: '0px', right: '20px', zIndex: '10' }}>
                <button onClick={toggleAllSeries} className='btn btn-light'>
                    <MDBIcon icon={allSeriesVisible ? 'eye-slash' : 'eye'} />
                    {allSeriesVisible ? ' Ocultar todo' : ' Mostrar todo'}
                </button>
            </div>
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
                ref={chartRef} // Asignar la referencia al gráfico
            />
        </div>
    );
};

export default ModelsGraphicByProduct;


