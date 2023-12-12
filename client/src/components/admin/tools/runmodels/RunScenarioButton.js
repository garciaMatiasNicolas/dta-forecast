import { MDBBtn, MDBModalDialog, MDBModal, MDBModalContent, MDBModalBody, MDBIcon} from 'mdb-react-ui-kit';
import { useState } from 'react';
import { ClipLoader } from "react-spinners";

const RunScenarioButton = ({ handleCloseModal }) => {
    
    const [innerModal, setInnerModal] = useState(false);

    const showModal = () => {
        handleCloseModal();;
        setInnerModal(true);
    }

    console.log('innerModal', innerModal);

    return (
        <>
            <MDBModal staticBackdrop  show={innerModal} setShow={setInnerModal} tabIndex='-1'>
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

export default RunScenarioButton