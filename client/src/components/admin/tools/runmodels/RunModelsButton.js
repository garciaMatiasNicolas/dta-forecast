import { MDBBtn, MDBModalDialog, MDBModal, MDBModalContent, MDBModalBody, MDBIcon} from 'mdb-react-ui-kit';
import { useState, useEffect } from 'react';
import { ClipLoader } from "react-spinners";
import { showErrorAlert } from '../../../other/Alerts';
import axios from 'axios';

const RunModelsButton = ({scenario}) => {

    const postData = () => {
        setBasicModal(true)
        // Logica para guardar escenario y luego correr modelo
    }
    
    const [basicModal, setBasicModal] = useState(false);
   
    const handleClick = async (e) => {
        let inputScenario = document.getElementsByName("scenario_name")[0];
        let inputPeriods = document.getElementsByName("pred_p")[0];
        
        if ( scenario === 'No hay escenarios' ){
            e.preventDefault();
            
            if (inputScenario.value.trim() !== '' && inputPeriods.value.trim() !== '') {
                postData();
            } 
            else {
                showErrorAlert('Los campos "Nombre escenario" y "Periodos de forecast" no deben estar vacios');
            }
        } 
        else {
            postData();
        }
    };
    
    return (
        <>
            <MDBBtn onClick={handleClick} type="submit" className="w-auto d-flex justify-content-center align-items-center gap-2" color="primary">
              <MDBIcon fas icon="forward" color="white"/>
              <span>Forecast</span>
            </MDBBtn>

            <MDBModal staticBackdrop  show={basicModal} setShow={setBasicModal} tabIndex='-1'>
                <MDBModalDialog>
                    <MDBModalContent>
                        <MDBModalBody className="d-flex justify-content-center align-items-center flex-column gap-2">
                            <ClipLoader color="#2b9eb3" size={50} />
                            <h5 >Corriendo modelos...</h5>
                        </MDBModalBody>
                    </MDBModalContent>
                </MDBModalDialog>
            </MDBModal>
        </>
    )
}

export default RunModelsButton