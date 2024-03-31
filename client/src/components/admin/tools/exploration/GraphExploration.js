import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { filters } from '../../../../data/filters';
import { MDBIcon } from 'mdb-react-ui-kit';

const apiUrl = process.env.REACT_APP_API_URL;
const GraphExploration = () => {
    
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
            filter_name: "all"
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
    }
    
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
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    };
    
    let combinedData = {};
    
    if (dataGraph.y && typeof dataGraph.y === 'object') {
        if (Array.isArray(dataGraph.y)) {
            combinedData = {
                labels: dataGraph.x,
                datasets: [
                    {
                        label: 'Actual',
                        data: dataGraph.y,
                        borderColor: 'rgba(53, 162, 235, 1)', 
                        backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    },
                ],
            };
        } else {
            combinedData = {
                labels: dataGraph.x,
                datasets: [
                    ...Object.keys(dataGraph.y).map((category) => ({
                        label: category,
                        data: dataGraph.y[category],
                        borderColor: getRandomColor(),
                        backgroundColor: 'rgba(255, 206, 86, 0.2)',
                        fill: false
                    })),
                ],
            };
        }
    }
    
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

  
            <div className="w-100" onDrop={handleDrop} onDragOver={handleDragOver} style={{ cursor: 'pointer' }}>
                <Line style={{"maxHeight": "450px"}}
                    data={combinedData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'right',
                                labels: {
                                    display: false,
                                    boxHeight:0.5,
                                }
                            },
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Fechas históricas',
                                    color: 'black',
                                },
                                ticks: {
                                    color: 'black',
                                },
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Venta real',
                                    color: 'black',
                                },
                                ticks: {
                                    color: 'black',
                                },
                                suggestedMin: 0,
                            },
                        },
                        elements: {
                            point: {
                                radius: 2.5, // Set the point radius to 0 to hide points
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default GraphExploration;

