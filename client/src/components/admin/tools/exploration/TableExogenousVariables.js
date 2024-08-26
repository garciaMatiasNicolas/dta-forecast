import axios from 'axios'
import { MDBIcon, MDBTable, MDBTableBody, MDBTableHead, MDBBtn } from 'mdb-react-ui-kit';
import React, { useEffect, useState } from 'react'
import ReactPaginate from 'react-paginate';

const apiUrl = process.env.REACT_APP_API_URL;

const TableExogenousVariables = () => {

    
    const token = localStorage.getItem('userToken');
    const [rows, setRows] = useState([]);
    const [dates, setDates] = useState([]);
    const [columns, setColumns] = useState(["Variable Exógena", "Familia", "Region", "Vendedor", "Cliente", "Categoria", "Subcategoria", "SKU"]);
    const [currentPage, setCurrentPage] = useState(0);
    const [exogData, setExogData] = useState(false)

    const itemsPerPage = 8;
    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };
    const offset = currentPage * itemsPerPage;

    useEffect(()=>{
        getFirstRenderTable();
    }, [])

    const getFirstRenderTable = () => {
        const data = {
            project_id: localStorage.getItem("projectId")
        }

        axios.post(`${apiUrl}/forecast/exog-table`, data, { headers:  {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        }})
        .then(res => {setExogData(true); setRows(res.data.rows); setDates(res.data.date_columns)})
        .catch(err => err.response.data.error === "not_data" && setExogData(false))
    }

    const handleOnChangeFilter = (e) => {
        if (e.target.value === "-----") {
            setColumns(["Variable Exógena", "Familia", "Region", "Vendedor", "Cliente", "Categoria", "Subcategoria", "SKU"])
            getFirstRenderTable();
        } else {
            const data = {
                project_id: localStorage.getItem("projectId"),
                group: e.target.value
            }
    
            axios.post(`${apiUrl}/forecast/exog-table`, data, { headers:  {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            }})
            .then(res => {setExogData(true); setRows(res.data.rows); setDates(res.data.date_columns)})
            .catch(err => {console.log(err); err.response.data.error === "not_data" && setExogData(false)})

            setColumns(["Variable Exógena", e.target.options[e.target.selectedIndex].textContent])
        }
    }


  return (
    <div className='d-flex flex-column justify-content-start align-items-start gap-3 mt-5 w-100'>
        <h5 className='text-primary'>Tabla de Variables exógenas</h5>
        {!exogData ? <p>No hay datos exógenos</p> : 
            <div className="w-100" style={{ overflow: 'auto', maxHeight:'800px' }}>
                
                <div className='d-flex w-auto gap-4 justify-content-start align-items-center mb-3'>
                    <div className='d-flex w-auto gap-2 justify-content-center align-items-center'>
                        <p className='text-primary mt-3'>Agrupar por:</p>
                        <select className='form-select w-auto' onChange={handleOnChangeFilter}>
                            <option defaultValue>-----</option>
                            <option value='Family'>Familia</option>
                            <option value='Region'>Region</option>
                            <option value='Salesman'>Vendedor</option>
                            <option value='Client'>Cliente</option>
                            <option value='Category'>Categoria</option>
                            <option value='Subcategory'>Subcategoria</option>
                            <option value='SKU'>SKU</option>
                        </select>
                    </div>
                    <MDBBtn className="w-auto" style={{ backgroundColor: '#25d366' }}>
                        Exportar como Excel
                        <MDBIcon className="ms-2" fas icon="file-export" />
                    </MDBBtn>
                </div>

                <div className="w-100" style={{ overflow: 'auto', maxHeight:'800px' }}>
                    <MDBTable hover  style={{ width: 'max-content', height: 'max-content' }}>
                        <MDBTableHead className="bg-primary">
                            <tr>
                                {columns.map(col => (
                                    <th scope='col' className="text-white" key={col}>{col}</th>
                                ))}
                                {dates.map(date => (
                                    <th scope='col' className="text-white">{date}</th>
                                ))}
                            </tr>
                        </MDBTableHead>
                        
                        <MDBTableBody>
                            {rows.slice(offset, offset + itemsPerPage).map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                        <td className='w-auto' key={cellIndex}>
                                        {cell === 'nan' ? '-' : cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </MDBTableBody>
                    </MDBTable>
                </div>
            </div>
        }
        
        <ReactPaginate
            previousLabel={<MDBIcon fas icon="angle-double-left" />}
            nextLabel={<MDBIcon fas icon="angle-double-right" />}
            breakLabel={'...'}
            pageCount={Math.ceil(exogData.length / itemsPerPage)}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageChange}
            containerClassName={'pagination'}
            activeClassName={'active'}
        />
    </div>
  )
}

export default TableExogenousVariables
