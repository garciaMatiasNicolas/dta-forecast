import axios from "axios";
import ToolsNav from "../components/navs/ToolsNav"
import { useState, useContext, useEffect, useRef } from "react";
import { ClipLoader } from "react-spinners";
import { showErrorAlert, showSuccessAlert, showWariningAlert } from "../components/other/Alerts";
import { MDBCheckbox, MDBCol, MDBContainer, MDBInput, MDBRow, MDBBtn, MDBIcon,  MDBModal, MDBModalDialog, MDBModalContent, MDBModalBody} from "mdb-react-ui-kit";
import { AppContext } from "../context/Context";
import convertData from "../functions/stringFormat";
import ScenariosHistory from "../components/admin/tools/ScenariosHistory";

const apiUrl = process.env.REACT_APP_API_URL;

const RunModelsPage = () => {
    
    const initialFormData = {
        user: localStorage.getItem("userPk"),
        scenario_name: '',
        project: localStorage.getItem("projectId"),
        file_id: 0,
        models: [],
        test_p: '',
        pred_p: ''
    };

    // STATES //
    const [fileTypes, setFileTypes] = useState([]);
    
    const [formData, setFormData] = useState(initialFormData);
    
    const [basicModal, setBasicModal] = useState(false);
    
    const [results, setResults] = useState([]);
    
    const [scenarios, setScenarios] = useState([]);

    // USE EFFECT //
    useEffect(() => {
        // Get file types
        axios.get(`http://localhost:8000/file-types`, {headers})
        .then(res => setFileTypes(res.data))
        .catch(err => console.log(err));
    }, []);

    const {setDataGraphic} = useContext(AppContext);

    const token = localStorage.getItem("userToken");
    const headers = {
        'Authorization': `Token ${token}`, 
        'Content-Type': 'application/json', 
    };

    const formRef = useRef(null);

    // State for show scenarios history
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

    const handleSelectChange = (event) => {
        const selectedValue = event.target.value;
        
        axios.get(`${apiUrl}/files`, { headers })
        .then(res => {
            let files = res.data;
            let projectId = parseInt(localStorage.getItem("projectId"))
            files.filter(file => file.model_type === selectedValue && file.project === projectId)
            let id = files[0].id
            setFormData({...formData, file_id: id});
        })
        .catch(error => {
            console.log(error);
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const convertedScenarioName = convertData(formData.scenario_name, false);
        const dataToSend = {
            ...formData,
            scenario_name: convertedScenarioName
        };
        axios.post(`${apiUrl}/scenarios/`, dataToSend, { headers })
        .then((res)=>{
            let id = res.data.scenario_id;
            let data = {scenario_id: id};

            axios.post(`${apiUrl}/test-model`, data, {headers})
            .then((res)=>{
                showSuccessAlert("Predicciones realizadas con exito", "Forecast finalizado");
                let url = res.data.url;
                let graphicData = res.data.graphic_data;
                let excelFile = `http://localhost:8000/${url}`;
                setResults([...results, excelFile]);
                setDataGraphic(graphicData);

                // Update scenarios history
                axios.get(`${apiUrl}/scenarios/`, {
                    headers: headers
                })
                .then(res => {
                    let projectId = parseInt(localStorage.getItem("projectId"))
                    let scenarios = res.data.filter(item => item.project === projectId);
                    setScenarios(scenarios);
                })
                .catch(() => {
                    showErrorAlert("Ocurrio un error inesperado, intente mas tarde");
                });
            })
            .catch((err)=>{
                if(err.response.data.error === "exogenous_variables_not_found") {
                    showWariningAlert("Para seleccionar modelos de variables exogenas, debe haber subido anteriormente la plantilla con datos de variables exógenas. Elija otro modelo, o bien, suba la plantilla requerida", "ATENCIÓN");
                } else {
                    showErrorAlert(`Ocurrio un error en la corrida de los modelos: ${err.response.data.error}`);
                }
                axios.delete(`${apiUrl}/scenarios/${id}`, { headers })
            })
            .finally(()=>{setBasicModal(!basicModal)}); 
        })
        .catch(()=>{
            showErrorAlert("Nombre de escenario ya utilizado");
            setBasicModal(!basicModal);
        });

        formRef.current.reset();
    };

    const isFormValid = () => {
        const { scenario_name, models, test_p, pred_p, file_id } = formData;
        return scenario_name && models.length > 0 && test_p && pred_p && file_id !== 0;
    };

    return (
        <main style={{"minHeight": "100vh"}} className="bg-white pt-5 pb-5">
            <ToolsNav/>
            <ScenariosHistory scenarioList={scenarios}/>
            <h2 style={{"color": "black"}} className='mb-2 ms-5'>Seleccion de modelos de corrida</h2>
            <MDBContainer className="mt-4 ms-4">
                <MDBRow>
                    <MDBCol size='12'>
                        <form ref={formRef} className='p-5 border rounded' onSubmit={handleSubmit}>
                            <MDBContainer>
                                <MDBRow>
                                    <MDBCol size='lg'>
                                        <p className="text-primary">Modelos Series Temporales</p>
                                        <MDBCheckbox name='modelSelection' value='holtsWintersExponentialSmoothing' id='holtsWintersExponentialSmoothing' label='Suavización Exponencial Holt-Winters' 
                                        onChange={() => handleCheckboxChange('holtsWintersExponentialSmoothing')}/>

                                        <MDBCheckbox name='modelSelection' value='holtsExponentialSmoothing' id='holtsExponentialSmoothing' label='Suavización Exponencial Holt' 
                                        onChange={() => handleCheckboxChange('holtsExponentialSmoothing')}/>

                                        <MDBCheckbox name='modelSelection' value='exponential_moving_average' id='exponential_moving_average' label='Promedio Móvil Exponencial ' 
                                        onChange={() => handleCheckboxChange('exponential_moving_average')}/>

                                        <MDBCheckbox name='modelSelection' value='simpleExponentialSmoothing' id='simpleExponentialSmoothing' label='Suavización Exponencial Simple'  
                                        onChange={() => handleCheckboxChange('simpleExponentialSmoothing')}/>

                                        <MDBCheckbox name='modelSelection' value='arima' id='arima' label='ARIMA ' onChange={() => handleCheckboxChange('arima')}/>
                                        
                                        <MDBCheckbox name='modelSelection' value='sarima' id='sarima' label='SARIMA' onChange={() => handleCheckboxChange('sarima')}/>

                                        <p className="text-primary mt-5">Modelos Variables Enxógenas</p>
                                        <MDBCheckbox name='modelSelection' value='arimax' id='arimax' label='ARIMAX ' onChange={() => handleCheckboxChange('arimax')}/>
                                        <MDBCheckbox name='modelSelection' value='sarimax' id='sarimax' label='SARIMAX' onChange={() => handleCheckboxChange('sarimax')}/>
                                        <MDBCheckbox name='modelSelection' value='autoarimax' id='autoarimax' label='AUTOARIMAX' onChange={() => handleCheckboxChange('autoarimax')}/>

                                        <p className="mt-5 text-primary">Modelos Machine Learning</p>
                                        <MDBCheckbox name='modelSelection' value='linearRegression' id='linearRegression' label='Regresión lineal' onChange={() => handleCheckboxChange('linearRegression')}/>
                                        <MDBCheckbox name='modelSelection' value='bayesian' id='bayesian' label='Regresion Bayesiana ' onChange={() => handleCheckboxChange('bayesian')}/>
                                        <MDBCheckbox name='modelSelection' value='lasso' id='lasso' label='Regresión Lasso' onChange={() => handleCheckboxChange('lasso')}/>
                                        <MDBCheckbox name='modelSelection' value='decisionTree' id='decisionTree' label='Árbol de decisiones' onChange={() => handleCheckboxChange('decisionTree')}/>

                                        <p className="mt-5 text-primary">Otros modelos</p>
                                        <MDBCheckbox name='modelSelection' value='prophet' id='prophet' label='Prophet' onChange={() => handleCheckboxChange('prophet')}/>
                                    </MDBCol>

                                    <MDBCol size='lg' className="d-flex justify-content-start align-items-center flex-column gap-3">
                                        <MDBInput label="Nombre de escenario" type="text" name="scenario_name" onChange={handleInputChange}/>
                                        <MDBInput label="Periodos de entrenamiento de modelo" name="test_p" type="number" onChange={handleInputChange}/>
                                        <MDBInput label="Periodos de forecast" name="pred_p" type="number" onChange={handleInputChange}/>
                                        <select onChange={handleSelectChange} class="form-select" aria-label="Default select example">
                                            <option selected>Selecciona tipo de archivo</option>
                                            {fileTypes.map((fileType) => (
                                                <option value={fileType.id}>{convertData(fileType.model_type, true)}</option>
                                            ))}
                                        </select>
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