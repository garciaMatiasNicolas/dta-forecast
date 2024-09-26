import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import Highcharts, { chart } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { MDBIcon } from 'mdb-react-ui-kit';

const apiUrl = process.env.REACT_APP_API_URL;

const GraphExogenousVariables = () => {
    const [allSeriesVisible, setAllSeriesVisible] = useState(true); // Estado para la visibilidad de las series
    const chartRef = useRef(null); // Referencia para el gráfico

    // AUTHORIZATION HEADERS //
    const token = localStorage.getItem("userToken");
    const headers = {
        'Authorization': `Token ${token}`, 
        'Content-Type': 'application/json', 
    };

    const [exogData, setexogData] = useState(false);
    const [chartOptions, setChartOptions] = useState({});

    // Función para obtener colores aleatorios
    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    useEffect(() => {
        const data = {
            project_id: localStorage.getItem("projectId")
        };

        axios.post(`${apiUrl}/forecast/exog-graph`, data, { headers: headers })
            .then(res => {
                if (res.data && res.data.dates) {
                    setexogData(true);

                    // Configurando los datos para Highcharts
                    const seriesData = res.data.data.map((data) => ({
                        name: data[0], // Etiqueta del dataset
                        data: data.slice(1), // Datos del dataset (sin la etiqueta)
                        color: getRandomColor(), // Asignar un color aleatorio
                        lineWidth: 2, // Ancho de las líneas
                    }));

                    // Opciones para Highcharts
                    setChartOptions({
                        title: {
                            text: 'Gráfico de Variables Exógenas',
                            style: {
                                color: 'black',
                            },
                        },
                        xAxis: {
                            categories: res.data.dates, // Fechas en el eje X
                            title: {
                                text: 'Fechas históricas',
                                style: {
                                    color: 'black',
                                }
                            },
                            labels: {
                                style: {
                                    color: 'black',
                                }
                            }
                        },
                        yAxis: {
                            title: {
                                text: 'Venta real',
                                style: {
                                    color: 'black',
                                }
                            },
                            labels: {
                                style: {
                                    color: 'black',
                                }
                            },
                            min: 0, // Valor mínimo en el eje Y
                        },
                        legend: {
                            align: 'right',
                            verticalAlign: 'top',
                            layout: 'vertical',
                            itemStyle: {
                                color: 'black',
                            },
                        },
                        series: seriesData,
                        tooltip: {
                            shared: true, // Tooltip compartido entre las series
                            crosshairs: true, // Líneas cruzadas al pasar el ratón
                        },
                        plotOptions: {
                            line: {
                                marker: {
                                    radius: 2.5 // Tamaño de los puntos en las líneas
                                }
                            }
                        },
    
                    });

                } else {
                    setexogData(false);
                }
            })
            .catch(err => err.response && err.response.data.error === 'not_data' && setexogData(false));
    }, []);

    const toggleAllSeries = () => {
        const chart = chartRef.current.chart;
        chart.series.forEach((series) => {
            series.setVisible(!allSeriesVisible, false); // Cambia la visibilidad sin redibujar
        });
        chart.redraw(); // Redibuja el gráfico
        setAllSeriesVisible(!allSeriesVisible); // Actualiza el estado
    };

    return (
        <div className='d-flex flex-column justify-content-start align-items-start gap-3 mt-5 w-100'>
            <h5 className='text-primary'>Gráfico de Variables exógenas</h5>
            <button onClick={toggleAllSeries} className='btn btn-light'>
                <MDBIcon icon={allSeriesVisible ? 'eye-slash' : 'eye'} />
                {allSeriesVisible ? ' Ocultar todo' : ' Mostrar todo'}
            </button>
            {!exogData ? <p>No hay datos exógenos</p> : <HighchartsReact highcharts={Highcharts} options={chartOptions} ref={chartRef}/>}
        </div>
    );
};

export default GraphExogenousVariables;
