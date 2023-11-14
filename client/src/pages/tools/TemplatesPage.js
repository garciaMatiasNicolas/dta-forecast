import React, { useEffect, useState } from 'react'
import TemplatesContainer from '../../containers/tools/uploads/TemplateContainer';
import ToolsNav from '../../components/navs/ToolsNav';
import axios from 'axios';
import { MDBIcon, MDBCollapse, MDBTable, MDBTableBody, MDBTableHead} from 'mdb-react-ui-kit';
import { showConifmationAlert } from '../../components/other/Alerts';

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
    .then(res => {setFiles(res.data); console.log(res.data)})
    .catch(err => console.log(err));
  }, []);

  // Function for download excel
  const handleDownload = (fileName, urlPath) => {
    const link = document.createElement("a");
    link.href = `${apiUrl}${urlPath}`;
    link.download = `${fileName}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteScenario = (objectId) => {
    showConifmationAlert("file", objectId);
  }

  return (
    <>
      <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-start gap-3 align-items-start p-3 pt-5 bg-white">
        <ToolsNav/>

        <div className="w-100 ms-5 mb-5" style={{"maxWidth": "650px"}}>
          <p style={{"cursor": "pointer", "color": "#285192"}} onClick={toggleShow}>
            <MDBIcon fas icon="history" /> Ver historial de archivos
          </p>
          <MDBCollapse show={showShow}>
            <MDBTable align='middle' className='caption-top'>
              <MDBTableHead>
                <tr>
                  <th scope='col'>ID</th>
                  <th scope='col'>Tipo de Archivo</th>
                  <th scope='col'>Excel</th>
                  <th scope='col'>Acciones</th>
                </tr>
              </MDBTableHead>
                <MDBTableBody>
                    {
                      files.length === 0 ? 
                      <tr>
                        <th scope='row'></th>
                        <td>No hay Archivos</td>
                        <td></td>
                        <td></td>
                      </tr>
                      :
                    
                      files.map(file => (
                      <tr>
                        <th scope='row'>{file.id}</th>
                        <td>{file.model_type}</td>
                        <td style={{ cursor: "pointer" }} onClick={() => handleDownload(file.model_type, file.file)} >
                          <MDBIcon fas icon='file-excel' /> Excel subido
                        </td>
                        <td>
                          <span onClick={() => handleDeleteScenario(file.id)} style={{"cursor": "pointer"}} className='ms-3'><MDBIcon fas icon="trash-alt" color="danger"/></span>
                        </td>
                      </tr>
                    ))}
                </MDBTableBody>
            </MDBTable>
          </MDBCollapse> 
        </div>
        <TemplatesContainer/>
      </main>
    </>
  )
}

export default TemplatesPage