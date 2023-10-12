import axios from "axios";
import ToolsNav from "../components/navs/ToolsNav"
import { useState, useContext } from "react";
import { ClipLoader } from "react-spinners";
import { showErrorAlert, showSuccessAlert } from "../components/other/Alerts";
import { MDBCheckbox, MDBCol, MDBContainer, MDBInput, MDBRow, MDBBtn, MDBIcon,  MDBModal, MDBModalDialog, MDBModalContent, MDBModalBody,} from "mdb-react-ui-kit";
import { AppContext } from "../context/Context";

const apiUrl = process.env.REACT_APP_API_URL;

const RunModelsPage = () => {
    const {setDataGraphic} = useContext(AppContext);

    const token = localStorage.getItem("userToken");
    const headers = {
        'Authorization': `Token ${token}`, 
        'Content-Type': 'application/json', 
    };
    
    const initialFormData = {
        user: localStorage.getItem("userPk"),
        scenario_name: '',
        project: localStorage.getItem("projectId"),
        file_id: 1,
        models: [],
        test_p: '',
        pred_p: ''
    };
    
    const [formData, setFormData] = useState(initialFormData);

    const [basicModal, setBasicModal] = useState(false);

    const [results, setResults] = useState([]);

    const showModal = () => setBasicModal(!basicModal);
    
    const handleCheckboxChange = (value) => {
        const updatedModels = [...formData.models];
        const index = updatedModels.indexOf(value);
    
        if (index === -1) {
          updatedModels.push(value);
        } else {
          updatedModels.splice(index, 1);
        }
    
        setFormData({ ...formData, models: updatedModels });
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        axios.post(`${apiUrl}/scenarios/`, formData, { headers })
        .then((res)=>{
            let id = res.data.scenario_id;
            let data = {scenario_id: id};

            axios.post(`${apiUrl}/test-model`, data, {headers})
            .then((res)=>{
                showSuccessAlert("Predicciones realizadas con exito", "Forecast finalizado");
                let url = res.data.url;
                let scenario = res.data.scenario;
                let graphicData = res.data.graphic_data;
                let excelFile = `http://localhost:8000/${url}`;
                setResults([...results, excelFile]);
                setDataGraphic(graphicData);
                console.log(scenario);
            })
            .catch((err)=>{
                showErrorAlert("Ocurrio un error inesperado");
                axios.delete(`${apiUrl}/scenarios/${id}`, { headers })
                .then(res => console.log(res.data))
                .catch(err => console.log(err));
            })
            .finally(()=>{setBasicModal(!basicModal)}); 
        })
        .catch(()=>{
            showErrorAlert("Nombre de escenario ya utilizado");
            setBasicModal(!basicModal);
        })
        
    };

    const isFormValid = () => {
        const { scenario_name, models, test_p, pred_p } = formData;
        return scenario_name && models.length > 0 && test_p && pred_p;
    };

    return (
        <main style={{"minHeight": "100vh"}} className="bg-white pt-5 pb-5">
            <ToolsNav/>
            <h2 style={{"color": "black"}} className='mb-2 ms-5'>Seleccion de modelos de corrida</h2>
            <MDBContainer className="mt-4 ms-4">
                <MDBRow>
                    <MDBCol size='12'>
                        <form className='p-5 border rounded' onSubmit={handleSubmit}>
                            <MDBContainer>
                                <MDBRow>
                                    <MDBCol size='lg'>
                                        <p style={{"color": "black"}}>Elige los modelos que quieres correr</p>
                                        <MDBCheckbox name='modelSelection' value='holtsWintersExponentialSmoothing' id='holtsWintersExponentialSmoothing' label='Suavización Exponencial Holt-Winters' 
                                        onChange={() => handleCheckboxChange('holtsWintersExponentialSmoothing')}/>
                                        <MDBCheckbox name='modelSelection' value='simpleExponentialSmoothing' id='simpleExponentialSmoothing' label='Suavización Exponencial Simple'  
                                        onChange={() => handleCheckboxChange('simpleExponentialSmoothing')}/>
                                        <MDBCheckbox name='modelSelection' value='linearRegression' id='linearRegression' label='Regresión lineal' onChange={() => handleCheckboxChange('linearRegression')}/>
                                        <MDBCheckbox name='modelSelection' value='arima' id='arima' label='ARIMA ' onChange={() => handleCheckboxChange('arima')}/>
                                    </MDBCol>

                                    <MDBCol size='lg' className="d-flex justify-content-center align-items-center flex-column gap-3">
                                        <MDBInput label="Nombre de escenario" type="text" name="scenario_name" onChange={handleInputChange}/>
                                        <MDBInput label="Periodos de entrenamiento de modelo" name="test_p" type="number" onChange={handleInputChange}/>
                                        <MDBInput label="Periodos de forecast" name="pred_p" type="number" onChange={handleInputChange}/>
                                    </MDBCol>
                                </MDBRow>
                            </MDBContainer>
                            
                            <MDBRow className="mt-4">
                                <MDBBtn
                                    type="submit" 
                                    className="w-auto d-flex justify-content-center align-items-center gap-2 ms-3" 
                                    color="primary" 
                                    disabled={!isFormValid()}
                                    onClick={showModal}
                                >
                                    <MDBIcon fas icon="forward" color="white"/>
                                    <span>Forecast</span>
                                </MDBBtn>
                            </MDBRow>
                        </form>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
            
            <MDBModal staticBackdrop tabIndex="-1" show={basicModal} setShow={setBasicModal}>
                <MDBModalDialog>
                <MDBModalContent>
                    <MDBModalBody>
                    <div className="d-flex justify-content-center align-items-center flex-column gap-2">
                        <ClipLoader color="#2b9eb3" size={50} /> 
                        <h5 >Corriendo modelos...</h5>
                    </div>
                    </MDBModalBody>
                </MDBModalContent>
                </MDBModalDialog>
            </MDBModal>
           
        </main>
    )
}

export default RunModelsPage