import { MDBIcon, MDBBadge, MDBBtn } from "mdb-react-ui-kit"
import {  useNavigate } from 'react-router-dom';
import axios from "axios";
import { showErrorAlert, showSuccessAlert } from "../../other/Alerts";

const Projects = ({props}) => {
  let navigate = useNavigate();

  let token = localStorage.getItem("userToken");

  const headers = {
    'Authorization': `Token ${token}`, 
    'Content-Type': 'application/json', 
  };

  const deleteProject = () => {
    axios.delete(`http://localhost:8000/projects/${props.id}`, {headers})
    .then(res => {
      showSuccessAlert(`Proyecto "${props.project_name}" eliminado`, "Proyecto eliminado");
    })
    .catch(err => {
      if (err.response.data.detail) {
        showErrorAlert("Su sesion ha expirado");
        navigate("/login");
        localStorage.clear();
      } else {
        showErrorAlert("Proyecto no encontrado");
      }
    })

  }

  const handleClick = () => {
    navigate(`/tools/${props.project_name}`);
    localStorage.removeItem('projectName');
    localStorage.setItem('projectName', props.project_name);
    localStorage.setItem('projectId', props.id)
  }

  return (
    <>
      <tr>
        <td style={{"cursor": "pointer"}} onClick={handleClick}>
          <div className='d-flex align-items-center'>
          <MDBIcon fas icon="home" size="3x" color="info"/>
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
          <MDBBtn onClick={deleteProject} color='danger' outline floating rounded size='sm'>
            <MDBIcon fas icon="times" color="danger"/>
          </MDBBtn>
        </td>
      </tr>
    </>
  )
}



export default Projects