import axios from 'axios';
import { MDBTable, MDBTableHead, MDBTableBody, MDBIcon, MDBBtn } from 'mdb-react-ui-kit';
import ReactPaginate from 'react-paginate';
import { showErrorAlert } from '../../../other/Alerts';
const apiUrl = process.env.REACT_APP_API_URL;

const ForecastValuedTable = ({ data, currentPage, setCurrentPage }) => {
    const itemsPerPage = 10;  // Número de ítems por página
    if (data.length === 0 || data === null) return <p>Loading...</p>;

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };

    const columns = Object.keys(data[0]);

    const renderTableRows = () => {
        const start = currentPage * itemsPerPage;
        const end = start + itemsPerPage;
        const slicedData = data.slice(start, end);

        return slicedData.map((item, index) => (
            <tr key={index}>
                {Object.entries(item).map(([key, value]) => (
                    <td className={`border text-center`} key={key}>
                        {value}
                    </td>
                ))}
            </tr>
        ));
    };

    // Function for download excel
    const handleDownload = (urlPath) => {
        const link = document.createElement("a");
        link.href = `${apiUrl}/${urlPath}`;
        link.download = `ForecastValorizado.xlsx`;
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

    return (
        <>
            <MDBBtn 
                className="w-auto mb-3" 
                style={{ backgroundColor: '#25d366' }} 
                onClick={handleExport}
                disabled={data.length === 0}
                > Exportar como Excel
                <MDBIcon className="ms-2" fas icon="file-export" />
            </MDBBtn> 

            <div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} className='d-flex justify-content-start align-items-start flex-column w-100'>
                <MDBTable hover className='w-auto'>
                    <MDBTableHead className='bg-primary'>
                        <tr className='w-auto h-auto border'>
                            {columns.map((key, index) => (
                                <th className='text-white border text-center' key={index}>
                                    <p>{key}</p>
                                </th>
                            ))}
                        </tr>
                    </MDBTableHead>
                    <MDBTableBody>
                        {renderTableRows()}
                    </MDBTableBody>
                </MDBTable>
            </div>

            {data.length > itemsPerPage && <ReactPaginate
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

export default ForecastValuedTable;
