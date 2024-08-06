import { useContext } from "react";
import Navbar from "../components/navs/Navbar";
import ToolContainer from "../containers/admin/ToolContainer";
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Tools from "../components/admin/tools/Tools";
import { AppContext } from "../context/Context";
import ToolsNav from "../components/navs/ToolsNav";
import { MDBCard, MDBCardTitle, MDBCardBody, MDBCardText, MDBIcon } from "mdb-react-ui-kit";

const ToolsPage = () => {
  const location = useLocation();
  const idProyecto = localStorage.getItem("projectId");
  const navigate = useNavigate();

  const { forecastPage, setForecastPage } = useContext(AppContext);

  const handleOnclickChange = () => {
    setForecastPage(true);
  }

  const handleNavInventort = () => {
    navigate(`/inventory`);
  };

  const handleNavUploadFiles = () => {
    navigate('/uploads');
  };

  const inventoryComponent = {
    title: "Inventario",
    text: "Gestor de inventario",
    icon: "warehouse",
    handleClick: handleNavInventort
  };

  const uploadFilesComponent = {
    title: "Subir Archivos",
    text: "Archivos & plantillas",
    icon: "cloud-upload-alt",
    handleClick: handleNavUploadFiles
  };

  const forecastComponent = {
    title: "Forecast",
    text: "Herramientas de forecast",
    icon: "chart-line",
    handleClick: handleOnclickChange
  };


  return (
    <div> 
      <Navbar/>
      {location.pathname === `/tools/project/${idProyecto}` ? (
        // Renderiza el contenido de la página principal
        <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-center gap-3 align-items-center p-3 bg-white">
          {forecastPage ? 
            <div>
              <ToolsNav/>
              <ToolContainer/> 
            </div>
            : 
            <div className="d-flex w-auto justify-content-center align-items-center gap-1 flex-wrap">
              <Tools props={uploadFilesComponent} />
              <Tools props={forecastComponent}/> 
              <Tools props={inventoryComponent}/>

              <a href={require(`../manual/Manual DTA FI&O.docx`)} download={"Manual DTA FI&O.docx"} target="_blank" rel="noreferrer">
                <MDBCard style={{"width": "19rem", "cursor": "pointer"}} alignment='center' className='hover-shadow border'>
                  <MDBCardBody>
                    <MDBCardTitle className="text-black">Manual DTA F&IO</MDBCardTitle>
                    <MDBCardText className="text-black">Aprende todo sobre nuestra app</MDBCardText>
                    <MDBIcon fas icon="book" size='6x' color='primary'/>
                  </MDBCardBody>
                </MDBCard>
              </a>

            </div>
          }
        </main> 
      ) : (
        // Si la ubicación actual es /tools/:idProyecto/:tool, renderiza solo el Outlet
        <Outlet/> 
      )}
    </div>
  )
}

export default ToolsPage