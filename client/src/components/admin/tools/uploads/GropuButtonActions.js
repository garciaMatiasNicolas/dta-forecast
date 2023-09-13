import { MDBBtn, MDBIcon } from 'mdb-react-ui-kit';
import React, { useRef } from 'react';


const GropuButtonActions = ({props}) => {
    const fileInputRef = useRef(null);

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        console.log('Archivo seleccionado:', file);
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