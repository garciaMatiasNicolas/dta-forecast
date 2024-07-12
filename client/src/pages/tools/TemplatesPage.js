import React, { useEffect, useState } from 'react'
import TemplatesContainer from '../../containers/tools/uploads/TemplateContainer';
import ToolsNav from '../../components/navs/ToolsNav';
import axios from 'axios';
import { MDBIcon, MDBTable, MDBTableBody, MDBTableHead} from 'mdb-react-ui-kit';
import ReactPaginate from 'react-paginate';   
import { showWariningAlert } from '../../components/other/Alerts';

const apiUrl = process.env.REACT_APP_API_URL;

const TemplatesPage = () => {

  const token = localStorage.getItem("userToken");
  const headers = {
    'Authorization': `Token ${token}`, 
    'Content-Type': 'application/json', 
  };

  const [files, setFiles] = useState([]);

  // State for show files history
  const [showShow, setShowShow] = useState(false);
  const toggleShow = () => setShowShow(!showShow);

  useEffect(() => {
    axios.get(`${apiUrl}/files`, {headers})
    .then(res => {
      let projectId = parseInt(localStorage.getItem("projectId"))
      let files = res.data.filter(item => item.project === projectId);
      files.length > 0 && showWariningAlert("Existen plantillas subidas para este proyecto, si sube alguna plantilla con datos que ya exista, se sobreescribira y se perderan las predicciones realizadas. Recomendamos actualizar las plantillas por proyecto", "ATENCION");
      setFiles(files);
    })
    .catch(err => console.log(err));
    
    
  }, []);

  const updateFileHistory = () => {
    axios.get(`${apiUrl}/files`, {headers})
    .then(res => {
      let projectId = parseInt(localStorage.getItem("projectId"))
      let files = res.data.filter(item => item.project === projectId);
      setFiles(files);
    })
    .catch(err => console.log(err));
  }

  // Function for download excel
  const handleDownload = (fileName, urlPath) => {
    const link = document.createElement("a");
    link.href = `${apiUrl}${urlPath}`;
    link.download = `${fileName}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3; // Cantidad de elementos por página

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = files.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <>
      <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-start gap-3 align-items-start p-3 pt-5 bg-white">
        <ToolsNav/>

        <div className="w-100 ms-5 mb-3 container mt-5" style={{"maxWidth": "700px"}}>
          <p style={{"cursor": "pointer", "color": "#285192"}} onClick={toggleShow}>
            <MDBIcon fas icon="history" /> Ver historial de archivos
          </p>
            <MDBTable align='middle' className='caption-top' hover>
              <MDBTableHead className="bg-primary">
                <tr>
                  <th scope='col' className="text-white">ID</th>
                  <th scope='col' className="text-white">Tipo de Archivo</th>
                  <th scope='col' className="text-white">Excel</th>
                  <th scope='col' className="text-white">Fecha de subida</th>
                  <th scope='col' className="text-white">Acciones</th>
                </tr>

              </MDBTableHead>
                <MDBTableBody>
                    {
                      currentItems.length === 0 ? 
                      <tr>
                        <th scope='row'></th>
                        <td>No hay Archivos</td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                      :
                    
                      currentItems.map(file => (
                      <tr>
                        <th scope='row'>{file.id}</th>
                        <td>{file.model_type}</td>
                        <td style={{ cursor: "pointer" }} onClick={() => handleDownload(file.model_type, file.file)} >
                          <MDBIcon fas icon='file-excel' /> .xlsx
                        </td>
                        <td>{new Date(file.uploaded_at).toISOString().split('T')[0]}</td>
                      </tr>
                    ))}
                </MDBTableBody>
            </MDBTable>
            <ReactPaginate
              pageCount={Math.ceil(files.length / itemsPerPage)}
              pageRangeDisplayed={5}
              marginPagesDisplayed={2}
              onPageChange={handlePageClick}
              containerClassName={'pagination'}
              subContainerClassName={'pages pagination'}
              activeClassName={'active'}
              previousLabel={<MDBIcon fas icon="angle-double-left" />}
              nextLabel={<MDBIcon fas icon="angle-double-right" />}
            />
        </div>
        <TemplatesContainer/>
      </main>
    </>
  )
}

export default TemplatesPage