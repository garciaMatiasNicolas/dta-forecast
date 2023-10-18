import { MDBIcon, MDBBadge, MDBBtn } from "mdb-react-ui-kit"
import {  useNavigate } from 'react-router-dom';
import DeleteProjectBtn from "./DeleteProjectBtn";
import { showErrorAlert } from "../../other/Alerts";

const apiUrl = process.env.REACT_APP_API_URL;

const Projects = ({props, deleteProject, updateProject}) => {
  let navigate = useNavigate();

  let token = localStorage.getItem("userToken");

  const headers = {
    'Authorization': `Token ${token}`, 
    'Content-Type': 'application/json', 
  };

  const handleClick = () => {
    if (props.status === false){
      showErrorAlert("El proyecto se encuentra inactivo, para poder visualizarlo debe activarlo nuevamente");
    }
    else
    {
      navigate(`/tools/project/${props.id}`);
      localStorage.removeItem('projectName');
      localStorage.setItem('projectName', props.project_name);
      localStorage.setItem('projectId', props.id)
    }
  }

  return (
    <>
      <tr>
        <td style={{"cursor": "pointer"}} onClick={handleClick}>
          <div className='d-flex align-items-center'>
          <MDBIcon fas icon="home" size="3x" color={!props.status ? 'danger' : 'success'}/>
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
          <DeleteProjectBtn projectData={props} deleteProject={deleteProject} updateProject={updateProject}/>
        </td>
      </tr>
    </>
  )
}



export default Projects