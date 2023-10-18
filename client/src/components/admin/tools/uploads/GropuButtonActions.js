import axios from 'axios';
import { MDBBtn, MDBIcon} from 'mdb-react-ui-kit';
import React, { useRef, useState } from 'react';
import { showErrorAlert, showSuccessAlert } from '../../../other/Alerts';

const apiUrl = process.env.REACT_APP_API_URL;

const GropuButtonActions = ({props}) => {
    const fileInputRef = useRef(null);

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const uploadFile = (data, headers) => {
        axios.post(`${apiUrl}/files/`, data, {headers})
        .then(res => {
            showSuccessAlert("Archivo subido exitosamente!", "Data recibida")
        })
        .catch(err => {
            if (err.response.data.error === "bad_request") {
                showErrorAlert("El archivo no se subio correctamente, intente nuevamente");
            } 
            else if(err.response.data.error === "columns_not_in_date_type"){
                showErrorAlert("El archivo debe contener sus columnas en formato fecha");
            }
            else {
                showErrorAlert("Error en el servidor");
            }
        })
    }

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
            "file_name": `Historical_Data_${projectName}_user${user}`,
            "project": projectId,
            "file": file,
            "model_type": "historical_data"
        };

        uploadFile(data, headers);
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
                <MDBBtn color='success' floating onClick={handleButtonClick} >
                    <MDBIcon fas icon="upload" />
                </MDBBtn>
            </div>

            <a href={require(`../../../../../public/templates/${props}`)} download={props} target="_blank" rel="noreferrer">
                <MDBBtn color='primary' floating>
                    <MDBIcon fas icon="download" />
                </MDBBtn>
            </a>

            <MDBBtn color='warning' floating>
                <MDBIcon fas icon="download" />
            </MDBBtn>
        
        </>

    )
}

export default GropuButtonActions