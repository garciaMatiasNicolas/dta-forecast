import { MDBIcon, MDBPagination, MDBPaginationItem, MDBPaginationLink } from 'mdb-react-ui-kit';
import { Link } from 'react-router-dom';

const ToolsNav = () => {
  const project = localStorage.getItem("projectId");
  return (
    <nav className='mb-2 ms-5'>
      <MDBPagination className='mb-0'>
        <Link to="/dashboard/">
          <MDBPaginationItem className='bg-transparent d-flex justify-content-center align-items-center gap-1 p-2' style={{"cursor": "pointer"}}>
            <span>«</span>
            <MDBIcon fas icon="home" color='primary' />
            <span>Inicio</span>
          </MDBPaginationItem>
        </Link>
        <Link to={`/tools/project/${project}`}>
          <MDBPaginationItem className='bg-transparent d-flex justify-content-center align-items-center gap-1 p-2' style={{"cursor": "pointer"}}>
            <span>«</span>
            <MDBIcon fas icon="tools" color='primary' />
            <span>Herramientas</span>
          </MDBPaginationItem>
        </Link>
      </MDBPagination>
    </nav>
  )
}

export default ToolsNav