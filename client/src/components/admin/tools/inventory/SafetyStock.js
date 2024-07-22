import React, { useEffect, useState } from 'react';
import { MDBTable, MDBTableHead, MDBTableBody, MDBIcon, MDBBtn, MDBInput } from 'mdb-react-ui-kit';
import ReactPaginate from 'react-paginate';
import axios from 'axios';
import { showErrorAlert } from '../../../other/Alerts';
import { ClipLoader } from 'react-spinners';
import DropdownFilters from './DropdownFilters';

const apiUrl = process.env.REACT_APP_API_URL;

const SafetyStock = () => {
    
    const itemsPerPage = 10;  // Número de ítems por página
    const [currentPage, setCurrentPage] = useState(0);
    const [data, setData] = useState([]);

    // Function for download excel
    const handleDownload = (urlPath) => {
        const link = document.createElement("a");
        link.href = `${apiUrl}/${urlPath}`;
        link.download = `StockDeSeguridad.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExport = () => {
        const dataToSend = {
            "columns": Object.keys(data[0]),
            "rows": data.map(obj => Object.values(obj)),
            "file_name": `StockDeSeguridad`,
            "project_pk": parseInt(localStorage.getItem("projectId"))
        };
        
        axios.post(`${apiUrl}/export_excel`, dataToSend, {
            headers: {
                'Authorization': `Token ${localStorage.getItem("userToken")}`, 
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            let file_path = res.data.file_url
            handleDownload(file_path);
        })
        .catch(err => {showErrorAlert(err.response.data); console.log(err)});  
    };
    
    useEffect(()=>{
        const token = localStorage.getItem("userToken");
        const headers = {
            'Authorization': `Token ${token}`, 
            'Content-Type': 'application/json', 
        };

        axios.post(`${apiUrl}/forecast/stock-data/`, 
        {
            project_id: localStorage.getItem("projectId"), 
            type: "safety stock",
            params: {
                next_buy: "15",
                forecast_or_historical: "historical",
                historical_periods: "12",
                forecast_periods: "0", 
                scenario_id: false,
                purchase_cost: 0,
                purchase_perc: 0
            }
        }, {headers})
        .then(res => setData(res.data.data))
        .catch(err => {err.response.data.error === "historical_data_none" ? showErrorAlert("No hay datos históricos") : showErrorAlert("Ocurrio un error inesperado");})

    }, []);

    if (!data) {
        return <div>No hay datos para mostrar</div>;
    } else if (data.length === 0) {
        return <ClipLoader/>
    }

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };
        
    const renderTableRows = () => {
        const start = currentPage * itemsPerPage;
        const end = start + itemsPerPage;
        const slicedData = data.slice(start, end);
        
        return slicedData.map((item, index) => (
          <tr key={index}>
            {Object.entries(item).map(([key, value]) => (
              <td key={key}>
                {value}
              </td>
            ))}
          </tr>
        ));
    };

    const handleSearchProduct = (event) => {
        const inputValue = event.target.value.toLowerCase(); 
        const filteredData = data.filter(item => item.Producto.toLowerCase().includes(inputValue));
        setData(filteredData);
    };

    return (
        <div className='w-100'>
            <div className="w-auto d-flex justify-content-start align-items-center gap-2 mb-5" style={{maxWidth: "500px"}}>
                <MDBInput
                    type="text"
                    label="SKU"
                    className="w-auto"
                    onChange={handleSearchProduct}
                />

                <MDBBtn 
                    className="w-auto" 
                    style={{ backgroundColor: '#25d366' }} 
                    onClick={handleExport}
                    disabled={data.length === 0}
                    > Exportar como Excel
                    <MDBIcon className="ms-2" fas icon="file-export" />
                </MDBBtn> 
            </div>

            <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', position:'relative' }}
            className='d-flex justify-content-start align-items-start flex-column w-100'>
                <MDBTable className='w-auto' hover>
                    <MDBTableHead className='bg-primary'>
                        <tr className='w-auto h-auto border'>
                        {Object.keys(data[0]).map((key, index) => (
                            <th className='text-white border text-center' key={index}>
                            {(key === "Familia" || key === "Categoria" || key === "Vendedor" || key === "Subcategoria" || key === "Cliente" ) ? 
                              <DropdownFilters key={index} name={key} data={data} setFilterData={setData}/> : 
                              <p>{key}</p>
                            }
                          </th>
                        ))}
                        </tr>
                    </MDBTableHead>
                    <MDBTableBody>
                        {renderTableRows()}
                    </MDBTableBody>
                </MDBTable>
            </div>

  
            { data.length > 0 && <ReactPaginate
            previousLabel={<MDBIcon fas icon="angle-double-left" />}
            nextLabel={<MDBIcon fas icon="angle-double-right" />}
            breakLabel={'...'}
            pageCount={Math.ceil(data.length / itemsPerPage)}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageChange}
            containerClassName={'pagination'}
            activeClassName={'active'}
            />}
        </div>
    )
}

export default SafetyStock;