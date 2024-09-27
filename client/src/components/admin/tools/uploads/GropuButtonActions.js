import { useRef, useState } from 'react';
import { MDBBtn, MDBIcon, MDBModal, MDBModalBody, MDBModalContent, MDBModalDialog } from 'mdb-react-ui-kit';
import axios from 'axios';
import { showAlertAfterExecutionScenario, showErrorAlert, showSuccessAlert } from '../../../other/Alerts';
import { ClipLoader } from 'react-spinners';


const apiUrl = process.env.REACT_APP_API_URL;

const GroupButtonActions = ({ tableName, path, idFile }) => {
    const fileInputRef = useRef(null);
    
    const [basicModal, setBasicModal] = useState(false);

    const showModal = () => setBasicModal(true);

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const uploadFile = (data, headers) => {
        axios.post(`${apiUrl}/files/`, data, { headers })
            .then(() => {
                showAlertAfterExecutionScenario("success", "Data subida", "Archivo subido exitosamente! Data recibida");
            })
            .catch(err => {
                if (err.response.data.error === "bad_request") {
                    showAlertAfterExecutionScenario("error","Error","El archivo no se subió correctamente, intente nuevamente");
                } else if (err.response.data.error === "columns_not_in_date_type") {
                    showAlertAfterExecutionScenario("error","Error","El archivo debe contener sus columnas en formato fecha, verifique el formato de las columnas e intente nuevamente");
                } else if (err.response.data.error === "dates_dont_match"){
                    data.model_type === 2 && showAlertAfterExecutionScenario("error","Error","Las fechas de su data exógena no coinciden con las que ya subio de su data histórica");
                    data.model_type === 1 && showAlertAfterExecutionScenario("error","Error","Las fechas de su data histórica no coinciden con las que ya subio de su data exógena");
                } else {
                    showAlertAfterExecutionScenario("error","Error",`Error en el servidor: ${err.response.data.log}`);
                }
            })
            .finally(() => {
                setBasicModal(false);
            })
    };

    const handleFileUpload = (event) => {
        let token = localStorage.getItem("userToken");
        const headers = {
            'Authorization': `Token ${token}`,
            'Content-Type': 'multipart/form-data',
        };
        
        const file = event.target.files[0];
        const user = localStorage.getItem("userPk");
        const projectName = localStorage.getItem('projectName');
        const projectId = localStorage.getItem("projectId");
        const data = {
            "user_owner": localStorage.getItem("userPk"),
            "file_name": `${tableName}_${projectName}_user${user}`,
            "project": projectId,
            "file": file,
            "model_type": idFile
        };

        file != null && showModal();
        
        setTimeout(() => {
            uploadFile(data, headers);
        }, 2000);
    };

    return (
        <>
            <div>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                />
                
                <MDBBtn disabled={idFile !== 1 && idFile !== 2 && idFile !== 3 && idFile !==4} color='success' floating onClick={handleButtonClick}>
                    <MDBIcon fas icon="upload" />
                </MDBBtn>
            </div>

            <a href={require(`../../../../../public/templates/${path}`)} download={path} target="_blank" rel="noreferrer">
                <MDBBtn color='primary' floating >
                    <MDBIcon fas icon="download" />
                </MDBBtn>
            </a>

            <MDBModal staticBackdrop tabIndex="-1" show={basicModal} setShow={setBasicModal}>
                <MDBModalDialog>
                    <MDBModalContent>
                        <MDBModalBody>
                            <div className="d-flex justify-content-center align-items-center flex-column gap-2">
                                <ClipLoader color="#2b9eb3" size={50} />
                                <h5>Subiendo data...</h5>
                            </div>
                        </MDBModalBody>
                    </MDBModalContent>
                </MDBModalDialog>
            </MDBModal>
        </>
    );
};

export default GroupButtonActions;
