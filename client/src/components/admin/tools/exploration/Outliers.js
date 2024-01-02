import axios, { all } from "axios";
import { MDBBtn, MDBIcon, MDBInput, MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import { useEffect, useState } from "react";
import { showErrorAlert } from "../../../other/Alerts";
import Plot from 'react-plotly.js';

const apiUrl = process.env.REACT_APP_API_URL;

const Outliers = () => {
    const token = localStorage.getItem('userToken');
    const headers = {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
    };

    const [dataGraph, setDataGraph] = useState({});
    const [sku, setSku] = useState("");

    useEffect(() => {
        getAllOutliers();
    }, []);

    const getAllOutliers = () => {
        const data = {
            'project': localStorage.getItem('projectId'),
            'threshold': 2
        };

        axios.post(`${apiUrl}/get-outliers`, data, { headers: headers })
        .then(res => {setDataGraph(res.data);})
        .catch(err => {
            if (err.response && err.response.data.error === 'not_data') {
                showErrorAlert('No hay datos históricos');
            }
        });
    }

    // Verificar si dataGraph contiene valores antes de usar sus propiedades
    if (!dataGraph || Object.keys(dataGraph).length === 0) {
        return <div>Loading...</div>; // O puedes mostrar un spinner o un mensaje de carga
    }

    const handleClickSku = () => {
        const data = {
            'project': localStorage.getItem('projectId'),
            'threshold': 2,
            "sku": sku
        };

        axios.post(`${apiUrl}/get-outliers`, data, { headers: headers })
        .then(res => setDataGraph(res.data))
        .catch(err => {
            if (err.response && err.response.data.error === 'not_data') {
                showErrorAlert('No hay datos históricos');
            } else if (err.response && err.response.data.error === 'sku_not_found')  {
                showErrorAlert('No se encontro el sku');
            }
        }); 
        setSku("");   
    }

    const { dates, sales, outliers, table_rows } = dataGraph;

    const handleExportExcel = () => {
        const staticColumns = ['Family', 'Region', 'Salesman', 'Client', 'Category', 'Subcategory', 'SKU', 'Description']
        const dynamicColumns = outliers.map(date => date);
        const allColumns = staticColumns.concat(dynamicColumns);

        const dataToSend = {
            "columns":  allColumns,
            "rows": table_rows,
            "file_name": `Outliers`,
            "project_pk": parseInt(localStorage.getItem("projectId"))
        };
        
        axios.post(`${apiUrl}/export_excel`, dataToSend, {
            headers: headers,
            responseType: 'blob'
        })
        .then(res => {
            // Crear un blob a partir de la respuesta
            const file = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            
            // Crear una URL para el blob
            const fileURL = URL.createObjectURL(file);

            // Crear un enlace y simular un clic para iniciar la descarga
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = 'Outliers.xlsx'; // Nombre del archivo que se descargará
            document.body.appendChild(a);
            a.click();

            // Limpiar el enlace y el blob después de la descarga
            window.URL.revokeObjectURL(fileURL);
            document.body.removeChild(a);
        })
        .catch(err => console.log(err)) 
        
    }

    return (
        <div className="d-flex flex-column justify-content-start align-items-start gap-3 mt-5 w-100">
            <h5 className='text-primary'>Gráfico de Valores Atípicos</h5>
            <div className='d-flex justify-content-start align-items-center gap-3 w-auto'>
                <MDBIcon icon="key" color='primary' />
                <MDBInput
                    label="Ingresa SKU"
                    name="sku"
                    value={sku}
                    onChange={(e)=>{setSku(e.target.value)}}
                />
                <MDBBtn color="primary" className="d-flex justify-content-center align-items-center" onClick={handleClickSku}><MDBIcon icon="search" color="white"/></MDBBtn>
                <p className="text-primary mt-3" onClick={getAllOutliers} style={{cursor: "pointer"}}>Reestablecer</p>
            </div>

            <div className="w-100 position-relative">

                <Plot className="w-100 position-relative"
                    data={[
                        {
                            x: dates,
                            y: sales,
                            mode: 'lines',
                            name: 'Sales'
                        },
                        {
                            x: dates.filter((date, index) => outliers.includes(date)),
                            y: sales.filter((_, index) => outliers.includes(dates[index])),
                            mode: 'markers',
                            marker: { size: 10, color: 'red' },
                            name: 'Outliers'
                        }
                    ]}
                />
            </div>

            <h5 className='text-primary mb-3'>Tabla de fechas con Valores Atípicos</h5>
            <MDBBtn className="w-auto mb-4" onClick={handleExportExcel} style={{ backgroundColor: '#25d366' }}>
                Exportar como Excel
                <MDBIcon className="ms-2" fas icon="file-export" />
            </MDBBtn> 
            <div className="w-100" style={{ overflow: 'auto', maxHeight:'800px' }}>
                <MDBTable hover  style={{ width: 'max-content', height: 'max-content' }}>
                    <MDBTableHead className="bg-primary">
                        <tr>
                            <th scope='col' className="text-white">Familia</th>
                            <th scope='col' className="text-white">Region</th>
                            <th scope='col' className="text-white">Vendedor</th>
                            <th scope='col' className="text-white">Cliente</th>
                            <th scope='col' className="text-white">Categoria</th>
                            <th scope='col' className="text-white">Subcategoria</th>
                            <th scope='col' className="text-white">SKU</th>
                            <th scope='col' className="text-white">Descripción</th>
                            {outliers.map(date => (
                                <th scope='col' className="text-white">{date}</th>
                            ))}
                        </tr>
                    </MDBTableHead>
                    
                    <MDBTableBody>
                        {table_rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                    <td className="w-auto" key={cellIndex}>{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </MDBTableBody>
                </MDBTable>
            </div>
        </div>
    );
};

export default Outliers;
