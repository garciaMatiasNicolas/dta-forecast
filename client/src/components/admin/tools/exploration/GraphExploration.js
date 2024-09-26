import React, { useState, useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axios from 'axios';
import { filters } from '../../../../data/filters';
import { MDBIcon } from 'mdb-react-ui-kit';

const apiUrl = process.env.REACT_APP_API_URL;
const GraphExploration = () => {

    const [allSeriesVisible, setAllSeriesVisible] = useState(true); // Estado para la visibilidad de las series
    const chartRef = useRef(null); // Referencia para el gráfico
    
    // AUTHORIZATION HEADERS //
    const token = localStorage.getItem("userToken");
    const headers = {
        'Authorization': `Token ${token}`, 
        'Content-Type': 'application/json', 
    };
    
    const [dataGraph, setDataGraph] = useState({x: [], y: []});
    const [draggedFilter, setDraggedFilter] = useState(null);
    
    useEffect(() => {
        getFirstGraph();
    }, []);

    const getFirstGraph = () => {
        const graphicData = {
            project_id: localStorage.getItem("projectId"),
            filter_name: "all", 
            component: "graph"
        }
      
        axios.post(`${apiUrl}/forecast/graphic-data`, graphicData, {
            headers: headers
        })
        .then(res => {
            setDataGraph(res.data);
        })
        .catch(err => {
            console.log(err);
        })
    };

    // Función para alternar la visibilidad de todas las series
    const toggleAllSeries = () => {
        const chart = chartRef.current.chart;
        chart.series.forEach((series) => {
            series.setVisible(!allSeriesVisible, false); // Cambia la visibilidad sin redibujar
        });
        chart.redraw(); // Redibuja el gráfico
        setAllSeriesVisible(!allSeriesVisible); // Actualiza el estado
    };
    
    // Manejar el evento de inicio de arrastre
    const handleDragStart = (event, filterName) => {
        event.dataTransfer.setData('text/plain', filterName);
        setDraggedFilter(filterName);
    };

    // Manejar el evento de soltar en el gráfico
    const handleDrop = (event) => {
        event.preventDefault();
        const filterName = event.dataTransfer.getData('text/plain');

        // Verificar si el elemento soltado coincide con los filtros disponibles
        if (draggedFilter === filterName) {
            // Realizar la lógica de filtrado basada en el elemento soltado
            const data = {
                project_id: localStorage.getItem('projectId'),
                filter_name: filterName,
                component: "graph"
            };

            axios.post(`${apiUrl}/forecast/graphic-data`, data, { headers: headers })
            .then((res) => setDataGraph(res.data))
            .catch((err) => console.log(err));
        }

        setDraggedFilter(null);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const getRandomColor = () => {
        // Colores vividos y contrastantes
        const vividColors = [
            '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', 
            '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', 
            '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', 
            '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'
        ];
        return vividColors[Math.floor(Math.random() * vividColors.length)];
    };

    // Configuración del gráfico para Highcharts
    const highchartOptions = {
        chart: {
            type: 'line',
            height: 450
        },
        title: {
            text: null // Elimina el título
        },
        xAxis: {
            categories: dataGraph.x,
            title: {
                text: 'Fechas históricas'
            }
        },
        yAxis: {
            title: {
                text: 'Venta real'
            },
            min: 0
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: 0,
            y: 0
        },
        series: Array.isArray(dataGraph.y) ? [
            {
                name: 'Venta real',
                data: dataGraph.y,
                color: '#042bb2'
            }
        ] : Object.keys(dataGraph.y || {}).map((category) => ({
            name: category,
            data: dataGraph.y[category],
            color: getRandomColor(),
            marker: {
                enabled: false // Elimina las formas en los puntos
            }
        })),
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: false
                },
                enableMouseTracking: true,
                marker: {
                    enabled: false // Deshabilitar puntos en las líneas
                }
            }
        },
        tooltip: {
            shared: true,
            crosshairs: true
        },
    };
    
    return (
        <div className="d-flex flex-column justify-content-start align-items-start gap-3 mt-5 w-100">
            <h5 className='text-primary'>Datos Históricos</h5>
            <div className='w-auto d-flex justify-content-start alignt-items-center gap-5 flex-wrap'>
                {filters.map((item) => (
                    item.name !== 'SKU' &&
                    <div
                        key={item.name}
                        className='w-auto'
                        draggable='true'
                        onDragStart={(e) => handleDragStart(e, item.name)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className='d-flex justify-content-start align-items-center gap-1 w-auto'>
                            <MDBIcon icon={item.icon} color='primary' />
                            <p className='mt-3 text-primary'>{item.label}</p>
                        </div>
                    </div>
                ))}
                <p className="text-primary mt-3" onClick={getFirstGraph} style={{cursor: "pointer"}}>Reestablecer</p>
            </div>

  
            <button onClick={toggleAllSeries} className='btn btn-light'>
                <MDBIcon icon={allSeriesVisible ? 'eye-slash' : 'eye'} />
                {allSeriesVisible ? ' Ocultar todo' : ' Mostrar todo'}
            </button>
            <div className="w-100" onDrop={handleDrop} onDragOver={handleDragOver} style={{ cursor: 'pointer' }}>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={highchartOptions}
                    ref={chartRef}
                />
            </div>
        </div>
    );
};

export default GraphExploration;

