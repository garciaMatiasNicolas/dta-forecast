import { useContext } from "react";
import Navbar from "../components/navs/Navbar";
import ToolContainer from "../containers/admin/ToolContainer";
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Tools from "../components/admin/tools/Tools";
import { AppContext } from "../context/Context";
import ToolsNav from "../components/navs/ToolsNav";

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

  const manualComponent = {
    title: "Manual DTA F&IO",
    text: "Aprende todo sobre nuestra app",
    icon: "book",
    handleClick: console.log("Download Manual")
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
              <Tools props={manualComponent}/>
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