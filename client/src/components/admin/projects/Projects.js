import { MDBIcon, MDBBadge, MDBBtn } from "mdb-react-ui-kit"
import {  useNavigate } from 'react-router-dom';
import ModalUpdateProject from "../modals/ModalUpdateProject";

const Projects = ({props}) => {
  let navigate = useNavigate();
  return (
    <>
      <tr>
        <td style={{"cursor": "pointer"}} onClick={()=>{navigate(`/tools/${props.project_name}`)}}>
          <div className='d-flex align-items-center'>
          <MDBIcon fas icon="home" size="3x"/>
            <div className='ms-3'>
              <p className='fw-bold mb-1'>{props.project_name}</p>
              <p className='text-muted mb-0'>{props.user_owner}</p>
            </div>
          </div>
        </td>
        <td>
          {
            props.status === true ? <MDBBadge color='success' pill>Activo</MDBBadge> : <MDBBadge color='danger' pill>Inactivo</MDBBadge>
          }
        </td>
        <td>{props.created_at}</td>
        <td>
          <MDBBtn color='success' outline floating rounded size='sm' className="me-2" data-bs-toggle="modal" data-bs-target="#modalUpdate">
            <MDBIcon fas icon="pen" color="succes"/>
          </MDBBtn>
          <MDBBtn color='danger' outline floating rounded size='sm' data-bs-toggle="modal" data-bs-target="#modalDelete">
            <MDBIcon fas icon="times" color="danger"/>
          </MDBBtn>
        </td>
      </tr>
    </>
  )
}

export default Projects