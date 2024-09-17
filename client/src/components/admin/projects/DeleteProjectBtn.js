import React, { useState } from 'react';
import {  useNavigate } from 'react-router-dom';
import {
    MDBBtn,
    MDBIcon,
    MDBModal,
    MDBModalDialog,
    MDBModalContent,
    MDBModalBody,
    MDBModalFooter,
} from 'mdb-react-ui-kit';
import axios from 'axios';
import { showErrorAlert, showSuccessAlert } from '../../other/Alerts';

const apiUrl = process.env.REACT_APP_API_URL;

const DeleteProjectBtn = ({projectData, deleteProject, updateProject}) => {

    const [basicModal, setBasicModal] = useState(false);

    let navigate = useNavigate();

    const toggleShow = () => setBasicModal(!basicModal);

    const deactivateProject = () => {
        const data = {
            type: "status"
        };
    
        const headers = {
            Authorization: `Token ${localStorage.getItem("userToken")}`,
            "Content-Type": "application/json"
        };
        
        let projectId = projectData.id

        axios
            .delete(`${apiUrl}/projects/${projectId}/`, {
                headers: headers,
                data: data 
            })
            .then(() => {
                showSuccessAlert("Proyecto desactivado satisfactoriamente", "Proyecto desactivado");
                updateProject(projectId, projectData);
            })
            .catch(err => {
                if (err.status === 401) {
                    showErrorAlert("Su sesión ha expirado");
                    navigate("/login");
                    localStorage.clear();
                } else {
                    err.response.data.error == "scenario_not_found" && showErrorAlert("El escenario no existe. Intente mas tarde. Si persiste, contactar a soporte");
                    err.response.data.error == "database_error" && showErrorAlert("Ocurrio un error al eliminar la tabla. Intente mas tarde. Si persiste, contactar a soporte");
                    err.response.data.error == "server_error" && showErrorAlert("Error en el servidor")
                }
            })
            .finally(() => {
                toggleShow();
            });
    };
    

    const deleteProjectServer = () => {
        const data = {
            type: "delete"
        };
    
        const headers = {
            Authorization: `Token ${localStorage.getItem("userToken")}`,
            "Content-Type": "application/json"
        };

        let projectId = projectData.id
    
        axios
            .delete(`${apiUrl}/projects/${projectId}/`, {
                headers: headers,
                data: data 
            })
            .then(() => {
                showSuccessAlert("Proyecto eliminado permanentemente", "Proyecto eliminado");
                deleteProject(projectId);
                
            })
            .catch(err => {
                console.log(err);
            })
            .finally(() => {
                toggleShow();
            });
    };
    
    
    return (
        <>
            <MDBBtn onClick={toggleShow} color='danger' outline floating rounded size='sm'>
                <MDBIcon fas icon="trash" color="danger"/>
            </MDBBtn>

            <MDBModal staticBackdrop  show={basicModal} setShow={setBasicModal} tabIndex='-1'>
                <MDBModalDialog centered className='p-3'>
                    <MDBModalContent>
                        <MDBModalBody className='mb-3'>
                            <h5 className='text-danger text-center'>¿Seguro que desea eliminar su proyecto?</h5>
                            <p className='text-center'>Puede desactivarlo y no perder toda la data de su proyecto</p>
                            { !projectData.status ?  
                                <MDBBtn disabled color='warning' style={{"marginLeft": "155px"}}>Desactivar</MDBBtn>
                                :
                                <MDBBtn onClick={deactivateProject} color='warning' style={{"marginLeft": "155px"}}>Desactivar</MDBBtn>
                            }
                        </MDBModalBody>

                        <MDBModalFooter>
                        <MDBBtn color='secondary' onClick={toggleShow}>
                            Cancelar
                        </MDBBtn>
                        <MDBBtn onClick={deleteProjectServer} color='danger'>
                            <MDBIcon fas icon='trash' style={{"marginRight": "10px"}}/>
                            Eliminar permanentemente
                        </MDBBtn>
                        </MDBModalFooter>
                    </MDBModalContent>
                </MDBModalDialog>
            </MDBModal>
        </>
    )
}

export default DeleteProjectBtn