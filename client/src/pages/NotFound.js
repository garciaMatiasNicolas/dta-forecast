import { MDBIcon } from "mdb-react-ui-kit";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div style={{"minHeight": "100vh", "background": "#007aff"}}>
      <h1 className="notFoundTitle text-white">404 Not Found</h1>
      <p className="text text-white">La página a la que intentas acceder no existe!</p>
      <button className="button d-flex justify-content-center align-items-center gap-2 ">
        <MDBIcon color='white' fas icon="long-arrow-alt-left" />
        <Link to='/dashboard' className="text-decoration-none text-white">Volve al inicio</Link>
      </button>
    </div>
  )
}

export default NotFound