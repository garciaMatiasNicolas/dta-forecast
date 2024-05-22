import axios from "axios";
import { useEffect, useState } from "react";
import { MDBTable, MDBTableHead, MDBTableBody, MDBIcon } from 'mdb-react-ui-kit';
import ReactPaginate from 'react-paginate';
import DropdownFilters from "../inventory/DropdownFilters";

const apiUrl = process.env.REACT_APP_API_URL;
const TableHistorical = () => {
    const [data, setData] = useState([]);
    const itemsPerPage = 12;  // Número de ítems por página
    const [currentPage, setCurrentPage] = useState(0);

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };

    useEffect(() => {
        // AUTHORIZATION HEADERS //
        const token = localStorage.getItem("userToken");
        const headers = {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        };

        const data = {
            project_id: localStorage.getItem("projectId"),
            filter_name: "all",
            component: "table"
        };

        axios.post(`${apiUrl}/forecast/graphic-data`, data, {
            headers: headers
        })
            .then(res => {
                setData(res.data);
            })
            .catch(err => {
                console.log(err);
            });
    }, []);

    const columns = data.length > 0 ? Object.keys(data[0]) : [];

    // Calcular el índice de inicio y fin para los elementos de la página actual
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = data.slice(startIndex, endIndex);

    const keys = ["Family", 'Category', 'Salesman', 'Subcategory', 'Client', 'Region']

    return (
        <>
            <div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} className='d-flex justify-content-start align-items-start flex-column w-100 mt-5'>
                <MDBTable hover className='w-auto'>
                    <MDBTableHead className='bg-primary'>
                        <tr className='w-auto h-auto border'>
                            {columns.map((column, index) => ( 
                                <th className='text-white border text-center' key={index}>
                                    {keys.includes(column) ? 
                                    <DropdownFilters key={index} name={column} data={data} setFilterData={setData} /> : 
                                    <p className="text-white">{column}</p>}
                                </th>
                            ))}
                        </tr>
                    </MDBTableHead>
                    <MDBTableBody>
                        {currentItems.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {columns.map((column, colIndex) => (
                                    <td style={{fontSize: "12px"}} key={colIndex}>{row[column]}</td>
                                ))}
                            </tr>
                        ))}
                    </MDBTableBody>
                </MDBTable>
                
            </div>
            { data.length > itemsPerPage && <ReactPaginate
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
        </>
    );
};

export default TableHistorical;
