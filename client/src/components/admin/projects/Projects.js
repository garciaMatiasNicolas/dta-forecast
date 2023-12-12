import { MDBIcon, MDBBadge, MDBBtn } from "mdb-react-ui-kit"
import {  useNavigate } from 'react-router-dom';
import DeleteProjectBtn from "./DeleteProjectBtn";
import { showErrorAlert, showSuccessAlert } from "../../other/Alerts";
import convertData from "../../../functions/stringFormat";
import Swal from "sweetalert2";
import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

const Projects = ({props, deleteProject, updateProject}) => {
  let navigate = useNavigate();
  let projectName = convertData(props.project_name, true);
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

  const handleUpdate = async (objectId) => {
    const { value: projectName } = await Swal.fire({
      title: "Actualizar Proyecto",
      input: "text",
      inputLabel: "Ingrese nuevo nombre del proyecto",
      inputPlaceholder: "Nombre proyecto",
      showCancelButton: true,
      cancelButtonText: "Cancelar"
    });

    if (projectName) {
      const data = { "project_name": convertData(projectName, false) };

      axios.put(`${apiUrl}/projects/${objectId}/`, data, {headers})
      .then(()=>{showSuccessAlert("El proyecto se actualizo satisfactoriamente", "Proyecto actualizado"); updateProject();})
      .catch(()=>{showErrorAlert("Ocurrio un error inesperdo, intente nuevamente")});

    } 
  }

  const newDate = new Date(props.created_at);
  const formatDate = newDate.toISOString().split('T')[0];

  return (
    <>
      <tr>
        <td style={{"cursor": "pointer"}} onClick={handleClick}>
          <div className='d-flex align-items-center'>
          <MDBIcon fas icon="home" size="3x" color={!props.status ? 'danger' : 'success'}/>
            <div className='ms-3'>
              <p className='fw-bold mb-1'>{projectName}</p>
              <p className='text-muted mb-0'>{props.user_owner}</p>
            </div>
          </div>
        </td>
        <td>
          {
            props.status === true ? <MDBBadge color='success' pill>Activo</MDBBadge> : <MDBBadge color='danger' pill>Inactivo</MDBBadge>
          }
        </td>
        <td>{formatDate}</td>
        <td>
          <MDBBtn onClick={()=>{handleUpdate(props.id)}} color='success' outline floating rounded size='sm' className="me-2">
            <MDBIcon fas icon="pen" color="succes"/>
          </MDBBtn>
          <DeleteProjectBtn projectData={props} deleteProject={deleteProject} updateProject={updateProject}/>
        </td>
      </tr>
    </>
  )
}



export default Projects