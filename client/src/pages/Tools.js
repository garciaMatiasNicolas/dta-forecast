import Navbar from "../components/navs/Navbar";
import ToolContainer from "../containers/admin/ToolContainer";
import { Outlet, useLocation } from 'react-router-dom';

const ToolsPage = () => {
  const location = useLocation();

  const idProyecto = localStorage.getItem("projectName");

  return (
    <div>
      <Navbar/>
      {location.pathname === `/tools/${idProyecto}` ? (
        // Renderiza el contenido de la página principal
        <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-center gap-3 align-items-center p-3 bg-white">
          <ToolContainer/>
        </main> 
      ) : (
        // Si la ubicación actual es /tools/:idProyecto/:tool, renderiza solo el Outlet
        <Outlet />
      )}
    </div>
  )
}

export default ToolsPage