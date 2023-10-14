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

const DeleteProjectBtn = ({projectData}) => {

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
    
        axios
            .delete(`${apiUrl}/projects/${projectData.id}/`, {
                headers: headers,
                data: data 
            })
            .then(() => {
                showSuccessAlert("Proyecto desactivado satisfactoriamente", "Proyecto desactivado");
            })
            .catch(err => {
                if (err.status === 401) {
                    showErrorAlert("Su sesión ha expirado");
                    navigate("/login");
                    localStorage.clear();
                } else if (err.status === 404) {
                    showErrorAlert("Proyecto no encontrado");
                } else {
                    console.log("Error desconocido:", err);
                }
            })
            .finally(() => {
                toggleShow();
            });
    };
    

    const deleteProject = () => {
        const data = {
            type: "delete"
        };
    
        const headers = {
            Authorization: `Token ${localStorage.getItem("userToken")}`,
            "Content-Type": "application/json"
        };
    
        axios
            .delete(`${apiUrl}/projects/${projectData.id}/`, {
                headers: headers,
                data: data 
            })
            .then(() => {
                showSuccessAlert("Proyecto eliminado permanentemente", "Proyecto eliminado");
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
                <MDBIcon fas icon="times" color="danger"/>
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
                        <MDBBtn onClick={deleteProject} color='danger'>
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