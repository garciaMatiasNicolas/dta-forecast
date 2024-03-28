import axios from 'axios';
import { MDBIcon, MDBPagination, MDBPaginationItem } from 'mdb-react-ui-kit';
import { useContext, useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/Context';

const apiUrl = process.env.REACT_APP_API_URL;

const ToolsNav = () => {
  const token = localStorage.getItem("userToken");
  const headers = {
    'Authorization': `Token ${token}`, 
    'Content-Type': 'application/json', 
  };

  const project = localStorage.getItem("projectId");
  const [projectName, setProjectName] = useState("");
  
  const { forecastPage, setForecastPage } = useContext(AppContext);
  const handleOnclickChange = () => {
    setForecastPage(false);
  }

  // USE EFFECT //
  useEffect(() => {
    // Get file types
    axios.get(`${apiUrl}/projects/${parseInt(project)}`, {headers})
    .then(res => setProjectName(res.data.project_name))
    .catch(err => console.log(err));
  }, []);

  return (
    <div className='mb-2 ms-5 w-auto d-flex justify-content-center align-itmes-center flex-column'>
      <nav className='d-flex justify-content-start'>
        <MDBPagination className='mb-0'>
          <Link to="/dashboard/">
            <MDBPaginationItem className='bg-transparent d-flex justify-content-center align-items-center gap-1 p-2' style={{"cursor": "pointer"}}>
              <span>«</span>
              <MDBIcon fas icon="home" color='primary' />
              <span>Inicio</span>
            </MDBPaginationItem>
          </Link>
          {
            forecastPage && 
            <Link to={`/tools/project/${project}`}>
              <MDBPaginationItem className='bg-transparent d-flex justify-content-center align-items-center gap-1 p-2' style={{"cursor": "pointer"}}>
                <span>«</span>
                <MDBIcon fas icon="chart-line" color='primary' />
                <span>Herramientas de Forecast</span>
              </MDBPaginationItem>
            </Link>
          }
          <Link to={`/tools/project/${project}`} onClick={handleOnclickChange}>
            <MDBPaginationItem className='bg-transparent d-flex justify-content-center align-items-center gap-1 p-2' style={{"cursor": "pointer"}}>
              <span>«</span>
              <MDBIcon fas icon="tools" color='primary' />
              <span>Forecast & Inventario</span>
            </MDBPaginationItem>
          </Link>
        </MDBPagination>
      </nav>
      <p className='ms-2 mt-3 d-flex gap-2'><p className='text-primary'>Proyecto:</p> {projectName}</p>
    </div>
  )
}

export default ToolsNav
