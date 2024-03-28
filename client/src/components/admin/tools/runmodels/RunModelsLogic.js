import axios from "axios";
import { useState, useContext, useEffect, useRef } from "react";
import convertData from '../../../../functions/stringFormat';
import RunModelsVisual from "./RunModelsVisual";
import { AppContext } from "../../../../context/Context";
import {showAlertAfterExecutionScenario, showErrorAlert} from "../../../other/Alerts";

const RunModelsLogicContainer = ({apiUrl, token}) => {
    const headers = {
        'Authorization': `Token ${token}`, 
        'Content-Type': 'application/json', 
    };
    
    const initialFormData = {
        user: localStorage.getItem("userPk"),
        scenario_name: '',
        project: localStorage.getItem("projectId"),
        file_id: 0,
        models: [],
        test_p: '',
        pred_p: '',
        error_p: '',
        error_type: 'MAPE'
    };

    // STATES //
    const [fileTypes, setFileTypes] = useState([]);
    
    const [formData, setFormData] = useState(initialFormData);
    
    const [basicModal, setBasicModal] = useState(false);
    
    const [results, setResults] = useState([]);
    
    const [scenarios, setScenarios] = useState([]);

    const [additionalParams, setAdditionalParams] = useState({});

    const [isSelected, setIsSelected] = useState([]);

    const [lastScenarioRan, setLastScenarioRan] = useState([]);

    // USE EFFECT //
    useEffect(() => {
        // Get file types
        axios.get(`${apiUrl}/file-types`, {headers})
        .then(res => setFileTypes(res.data))
        .catch(err => console.log(err));

        // Get last scenario ran
        axios.get(`${apiUrl}/scenarios`, {headers})
        .then(res => {
            let projectId = localStorage.getItem("projectId");
            let scenarios = res.data.filter(item => item.project_id === projectId ); 
            setLastScenarioRan(scenarios[res.data.length - 1])
        })
        .catch(err => console.log(err));
    }, []);

    const {setDataGraphic} = useContext(AppContext);

    const formRef = useRef(null);

    // State for show scenarios history
    const showModal = () => setBasicModal(!basicModal);
    
    const handleCheckboxChange = (value, modelName) => {
        const updatedModels = [...formData.models];
        const index = updatedModels.indexOf(value);
        let isChecked = false;
    
        if (index === -1) {
          updatedModels.push(value);
          isChecked = true;
        } else {
          updatedModels.splice(index, 1);
        }
    
        setFormData({ ...formData, models: updatedModels });

        if(isChecked) {
            setIsSelected(updatedModels) 
        } 
        else {
            delete additionalParams[`${modelName}_params`];
            setIsSelected(updatedModels);
            if (modelName === 'prophet' || modelName === 'arima' || modelName === 'sarima') {
                document.getElementById(`set${modelName}`).checked = false;
            }
        }
    };

    const areParamsSetted = (modelName, params, typeOfInsertion) => {

        if (modelName === "arima" || modelName === 'sarima'){

            if (typeOfInsertion === 'setParams'){
                const [ pValue, dValue, qValue ] = params
            
                setAdditionalParams(prevState => ({
                    ...prevState,
                    [`${modelName}_params`]:  [ pValue, dValue, qValue ]
                }));
            }

            typeOfInsertion === 'deleteParams' && delete additionalParams[`${modelName}_params`];
        }
        
        else if (modelName === "holtsWinters" || modelName === 'holts'){
            if (typeOfInsertion === 'setParams'){
                const [ selectedTrend, selectedSeasonal ] = params
            
                setAdditionalParams(prevState => ({
                    ...prevState,
                    [`${modelName}_params`]:  [ selectedTrend, selectedSeasonal ]
                }));
            }
            
            typeOfInsertion === 'deleteParams' && delete additionalParams[`${modelName}_params`];
        }

        else if (modelName === 'prophet'){
            if (typeOfInsertion === 'setParams'){
                const [ seasonality_mode, seasonality_prior_scale,
                    uncertainty_samples, changepoint_prior_scale ] = params
            
                setAdditionalParams(prevState => ({
                    ...prevState,
                    [`${modelName}_params`]:  [ seasonality_mode, seasonality_prior_scale,
                        uncertainty_samples, changepoint_prior_scale ]
                }));
            }
            
            typeOfInsertion === 'deleteParams' && delete additionalParams[`${modelName}_params`];
        }
        
    }
    
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        
        const regex = /[^A-Za-z0-9\s]/g;
        !regex.test(value) ? setFormData({ ...formData, [name]: value }) : showErrorAlert('El nombre del escenario no puede contener caracteres especiales.');
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

    const handleOptChange = (e) => {
        setFormData({ ...formData, error_type: e.target.id });
    } 

    const handleSubmit = (event) => {
        event.preventDefault();
        const convertedScenarioName = convertData(formData.scenario_name, false);
        const dataToSend = {
            ...formData,
            scenario_name: convertedScenarioName
        };

        axios.post(`${apiUrl}/scenarios/`, dataToSend, { headers })
        .then((res)=>{
            showModal();
            let id = res.data.scenario_id;
            let data = {
                scenario_id: id,
                additional_params: additionalParams
            };

            axios.post(`${apiUrl}/forecast/test-model`, data, {headers})
            .then((res)=>{
                setBasicModal(false);
                let url = res.data.url;
                let graphicData = res.data.graphic_data;
                let excelFile = `${apiUrl}/${url}`;
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
                    showAlertAfterExecutionScenario("error","Error","Ocurrio un error inesperado, intente mas tarde");
                });
                
                showAlertAfterExecutionScenario("success", "Forecast finalizado", "Predicciones realizadas con exito");
            })
            .catch((err)=>{
                setBasicModal(false);
                if(err.response.data.error === "not_exog_data") {
                    showAlertAfterExecutionScenario("error", "Error", "Para seleccionar modelos de variables exogenas, debe haber subido anteriormente la plantilla con datos de variables exógenas. Elija otro modelo, o bien, suba la plantilla requerida")
                } else {
                    showAlertAfterExecutionScenario("error", "Error", `Ocurrio un error en la corrida de los modelos: ${err.response.data.error}`);
                }
                axios.delete(`${apiUrl}/scenarios/${id}`, { headers })
            })
            .finally(()=>{setBasicModal(false)}); 
        })
        .catch((err)=>{
            if (err.response.data.error = 'scenario_name_already_exists'){
                showAlertAfterExecutionScenario("error","Error","Nombre de escenario ya utilizado");
            }
        })
        
        formRef.current.reset(); 
        setAdditionalParams({}); 
        setFormData(initialFormData);
    };

    const isFormValid = () => {
        const { scenario_name, models, test_p, pred_p, file_id } = formData;
        let isFormValid;
        
        if (models.includes('sarima')) {
            isFormValid = scenario_name && models.length > 0 && test_p && pred_p && file_id !== 0 && additionalParams['sarima_params'];
        } else if (models.includes('arima')) {
            isFormValid = scenario_name && models.length > 0 && test_p && pred_p && file_id !== 0 && additionalParams['arima_params'];
        } else if (models.includes('prophet')) {
            isFormValid = scenario_name && models.length > 0 && test_p && pred_p && file_id !== 0 && additionalParams['prophet_params'];
        } /* else if (models.includes('holtsExponentialSmoothing')) {
            isFormValid = scenario_name && models.length > 0 && test_p && pred_p && file_id !== 0 && additionalParams['holts_params'];
        } else if (models.includes('holtsWintersExponentialSmoothing')) {
            isFormValid = scenario_name && models.length > 0 && test_p && pred_p && file_id !== 0 && additionalParams['holtsWinters_params']; }*/
        else {
            isFormValid = scenario_name && models.length > 0 && test_p && pred_p && file_id !== 0 
        }

        return isFormValid;
    };
  
    return (
        <RunModelsVisual
            formData={formData}
            fileTypes={fileTypes}
            basicModal={basicModal}
            setBasicModal={setBasicModal}
            lastScenarioRan={lastScenarioRan}
            results={results}
            scenarios={scenarios}
            additionalParams={additionalParams}
            setFormData={setFormData}
            formRef={formRef}
            showModal={showModal}
            handleOptChange={handleOptChange}
            setAdditionalParams={setAdditionalParams}
            handleSubmit={handleSubmit}
            areParamsSetted={areParamsSetted}
            handleCheckboxChange={handleCheckboxChange}
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
            isFormValid={isFormValid}
            isSelected={isSelected}
        />
    )
}

export default RunModelsLogicContainer
