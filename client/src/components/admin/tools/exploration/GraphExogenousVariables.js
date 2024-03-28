import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2';

const apiUrl = process.env.REACT_APP_API_URL;
const GraphExogenousVariables = () => {
    
    // AUTHORIZATION HEADERS //
    const token = localStorage.getItem("userToken");
    const headers = {
        'Authorization': `Token ${token}`, 
        'Content-Type': 'application/json', 
    };

    const [exogData, setexogData] = useState(false);
    const [dataGraph, setDataGraph] = useState([]);

    // Función para obtener colores aleatorios
    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    useEffect(()=> {
        const data = {
            project_id: localStorage.getItem("projectId")
        }
        
        axios.post(`${apiUrl}/forecast/exog-graph`, data, {headers:headers})
        .then(res => {
            setexogData(true); 
            
            if (res.data && res.data.dates) {
                setexogData(true);

                let chartData = {
                    labels: res.data.dates,
                    datasets: res.data.data.map((data) => ({
                        label: data[0], // Tomando el primer elemento como etiqueta
                        data: data.slice(1), // Tomando el resto como datos
                        fill: false,
                        borderColor: getRandomColor(),
                    })),
                }
        
                setDataGraph(chartData);

            } else {
                setexogData(false);
            }
        })
        .catch(err => err.response.data.error === 'not_data' && setDataGraph(false))
    }, [])
    
    const options={
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
    }


    return (
        <div className='d-flex flex-column justify-content-start align-items-start gap-3 mt-5 w-100'>
            <h5 className='text-primary'>Gráfico de Variables exógenas</h5>
            {!exogData ? <p>No hay datos exógenos</p> : <Line options={options} data={dataGraph} />}
        </div>
    )
}

export default GraphExogenousVariables
