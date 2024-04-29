import { useState } from "react";
import axios from "axios";
import { showErrorAlert } from "../../../other/Alerts";
import {
    MDBBtn,
    MDBIcon,
    MDBInput,
} from 'mdb-react-ui-kit';
import Table from "./TableWithAvg";

const apiUrl = process.env.REACT_APP_API_URL;

const FiltersNested = ({data}) => {
    const [orderedData, setOrderedData] = useState(data);

    const handleExport = () => {
        const dataToSend = {
            "columns": Object.keys(data[0]),
            "rows": orderedData.map(obj => Object.values(obj)),
            "file_name": `StockPorProducto`,
            "project_pk": parseInt(localStorage.getItem("projectId"))
        };
          
        axios.post(`${apiUrl}/export_excel`, dataToSend, {
            headers: {
                'Authorization': `Token ${localStorage.getItem("userToken")}`, 
                'Content-Type': 'application/json'
            },
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
            a.download = 'StockData'; // Nombre del archivo que se descargará
            document.body.appendChild(a);
            a.click();
    
            // Limpiar el enlace y el blob después de la descarga
            window.URL.revokeObjectURL(fileURL);
            document.body.removeChild(a);
        })
        .catch(err => {showErrorAlert(err.response.data); console.log(err)});  
    };

    const handleSearchProduct = (event) => {
        const inputValue = event.target.value.toLowerCase(); 
        const filteredData = data.filter(item => item.Producto.toLowerCase().includes(inputValue));
        setOrderedData(filteredData);
    };

    if (!data || data.length === 0) {
        return <div></div>;
    };
    
    return (
        <div className="w-100 gap-4 d-flex justify-content-start align-items-start flex-column">
            <h5 className='text-primary'>Tabla de stock por producto</h5>

            <MDBBtn 
                className="w-auto" 
                style={{ backgroundColor: '#25d366' }} 
                onClick={handleExport}
                disabled={orderedData.length === 0}
                > Exportar como Excel
                <MDBIcon className="ms-2" fas icon="file-export" />
            </MDBBtn> 

            <div className="w-100 d-flex justify-content-between align-items-center">
                
                <div className="w-auto d-flex justify-content-between align-items-center gap-2">
                    <MDBInput
                        type="text"
                        label="SKU"
                        className="w-auto"
                        onChange={handleSearchProduct}
                    />
                    
                </div>
            
            </div>
            
            <Table data={orderedData} setData={setOrderedData}/>
        </div>
    );
}


export default FiltersNested;