import React, { useState } from 'react';
import axios from "axios";
import { ClipLoader } from "react-spinners";
import {
    MDBBtn,
    MDBModal,
    MDBModalDialog,
    MDBModalContent,
    MDBModalHeader,
    MDBModalTitle,
    MDBModalBody,
    MDBModalFooter,
    MDBIcon,
    MDBInput
} from 'mdb-react-ui-kit';
import { showErrorAlert, showSuccessAlert } from '../../other/Alerts';
import { useNavigate } from 'react-router-dom';
import convertData from '../../../functions/stringFormat';


const apiUrl = process.env.REACT_APP_API_URL;


const CreateProjectBtn = ({createProject}) => {
    const [basicModal, setBasicModal] = useState(false);

    const [loading, setLoading] = useState(false);

    const [projectData, setProjectData] = useState({
        'project_name': '',
        'user_owner': localStorage.getItem('userPk')
    });
    
    const handleOnChange = (e) => {
        const {name, value} = e.target;
        setProjectData({
            ...projectData,
            [name]: value
        })
    }

    const toggleShow = () => setBasicModal(!basicModal);

    const handleSubmit = (e) => {
        e.preventDefault();
        createNewProject();
    };

    const headers = {
        'Authorization': `Token ${localStorage.getItem('userToken')}`, 
        'Content-Type': 'application/json', 
    };
    
    let navigate = useNavigate();
    
    const createNewProject =  () => {
        setLoading(true);
        const convertedProjectName = convertData(projectData.project_name, false);
        const dataToSend = {
            ...projectData,
            project_name: convertedProjectName
        };
        
        axios.post(`${apiUrl}/projects/`, dataToSend, { headers })
        .then((res) => {
            showSuccessAlert("Proyecto creado exitosamente", "Creado");
            createProject(res.data.project);
        })
        .catch(err => {
            if (err.response.data.error === "bad_request") {
                showErrorAlert("Ya existe un proyecto con ese nombre, intente con otro");
            } 
            else if (err.status === 401) {
                showErrorAlert("Su sesion ha expirado");
                navigate("/login/");
                localStorage.clear();
            }
            else {
                showErrorAlert("Ocurrio un error inesperado, intente mas tarde");
            }
        })
        .finally(() => {
            setLoading(false);
            toggleShow();
        });
    };  

    return (
        <div className="d-flex flex-column justify-content-center align-items-center">
            <span>Nuevo</span>
            
            <MDBBtn onClick={toggleShow} className="text-dark" floating color="light" outline>
                <MDBIcon fas icon="plus" size="lg"/>
            </MDBBtn>
            
            <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1'>
                <MDBModalDialog>
                    <MDBModalContent>
                        <MDBModalHeader>
                            <MDBModalTitle>Crear nuevo proyecto</MDBModalTitle>
                            <MDBBtn className='btn-close' color='none' onClick={toggleShow}></MDBBtn>
                        </MDBModalHeader>
                        <form onSubmit={handleSubmit}>
                            <MDBModalBody>
                                <div>
                                    <MDBInput 
                                        value={projectData.project_name}
                                        onChange={handleOnChange}
                                        name='project_name' id='project_name'
                                        label='Nombre de tu nuevo proyecto' type='text' size='lg'
                                    />
                                </div>
                            </MDBModalBody>

                            <MDBModalFooter>
                                <MDBBtn type='submit' className='d-flex justify-content-center align-items-center gap-2'>
                                    <span>Crear</span>
                                    { loading && <ClipLoader color="#ffffff" loading={loading} size={15} /> }
                                </MDBBtn>
                            </MDBModalFooter>
                        </form>
                    </MDBModalContent>
                </MDBModalDialog>
            </MDBModal>
        </div>
    )
}

export default CreateProjectBtn