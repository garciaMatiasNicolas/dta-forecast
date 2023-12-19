import axios from "axios";
import { useState, useContext, useEffect, useRef } from "react";
import convertData from '../../../../functions/stringFormat';
import RunModelsVisual from "./RunModelsVisual";
import { AppContext } from "../../../../context/Context";
import ParamsHoltsWintersAlert from "../../../other/ParamsHoltsAlert";
import ParamsArimaAlert from "../../../other/ParamsArimaAlert";
import {showErrorAlert, showSuccessAlert, showWariningAlert} from "../../../other/Alerts";
import showToast from "../../../other/Toasts";
import ParamsProphetAlert from "../../../other/ParamsProphetAlert";


const RunModelsLogicContainer = ({apiUrl, token}) => {
    const headers = {
        'Authorization': `Token ${token}`, 
        'Content-Type': 'application/json', 
    };
  
    const [selectedError, setSelectedError] = useState('mape');
    
    const initialFormData = {
        user: localStorage.getItem("userPk"),
        scenario_name: '',
        project: localStorage.getItem("projectId"),
        file_id: 0,
        models: [],
        test_p: '',
        pred_p: '',
        error_type: 'MAPE'
    };

    // STATES //
    const [fileTypes, setFileTypes] = useState([]);
    
    const [formData, setFormData] = useState(initialFormData);
    
    const [basicModal, setBasicModal] = useState(false);
    
    const [results, setResults] = useState([]);
    
    const [scenarios, setScenarios] = useState([]);

    const [additionalParams, setAdditionalParams] = useState({});


    // USE EFFECT //
    useEffect(() => {
        // Get file types
        axios.get(`${apiUrl}/file-types`, {headers})
        .then(res => setFileTypes(res.data))
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

        isChecked ? handleAdditionalParams(modelName) : delete additionalParams[`${modelName}_params`];
    };

    const handleAdditionalParams = async (modelName) => {
        console.log(additionalParams);
        if (modelName === "arima" || modelName === 'sarima'){
            const { value: result } = await ParamsArimaAlert();
        
            if (result !== undefined) {
                const { pValue, dValue, qValue } = result.value;
                
                setAdditionalParams(prevState => ({
                    ...prevState,
                    [`${modelName}_params`]:  [ pValue, dValue, qValue ]
                }));

            } else {
                setAdditionalParams(prevState => ({
                    ...prevState,
                    [`${modelName}_params`]:  [ '0', '0', '0' ]
                }));
            }
            
            showToast("Parametros establecidos exitosamente", "success");
        }
        
        else if (modelName === "holtsWinters" || modelName === 'holts'){
            const { value: result } = await ParamsHoltsWintersAlert(modelName);
            if (result !== undefined) {
                const { selectedTrend, selectedSeasonal } = result.value;
                
                setAdditionalParams(prevState => ({
                    ...prevState,
                    [`${modelName}_params`]: [selectedTrend, selectedSeasonal]
                }));
            } else {
                setAdditionalParams(prevState => ({
                    ...prevState,
                    [`${modelName}_params`] : ['add', 'add']
                }))
            }
            showToast("Parametros establecidos exitosamente", "success");
        }

        else if (modelName === 'prophet'){
            const { value: result } = await ParamsProphetAlert();
            
            if (result !== undefined) {
                const { seasonality_mode, seasonality_prior_scale, growth, uncertainty_samples, changepoint_prior_scale } = result.value;
                
                setAdditionalParams(prevState => ({
                    ...prevState,
                    [`${modelName}_params`]: [seasonality_mode, seasonality_prior_scale, growth, uncertainty_samples, changepoint_prior_scale]
                }));
            } else {
                setAdditionalParams(prevState => ({
                    ...prevState,
                    [`${modelName}_params`] : ['additive', 10.0, 'linear', 1000, 0.05]
                }))
            }
            showToast("Parametros establecidos exitosamente", "success");
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

        console.log(dataToSend);

        axios.post(`${apiUrl}/scenarios/`, dataToSend, { headers })
        .then((res)=>{
            showModal();
            let id = res.data.scenario_id;
            let data = {
                scenario_id: id,
                additional_params: additionalParams
            };

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
            .finally(()=>{setBasicModal(false)}); 
        })
        .catch((err)=>{
            showErrorAlert("Nombre de escenario ya utilizado");
            console.log(err.response.data)
        });
        
        formRef.current.reset();
        setAdditionalParams({}); 
    };

    const isFormValid = () => {
        const { scenario_name, models, test_p, pred_p, file_id } = formData;
        return scenario_name && models.length > 0 && test_p && pred_p && file_id !== 0;
    };
  
    return (
        <RunModelsVisual
            formData={formData}
            fileTypes={fileTypes}
            basicModal={basicModal}
            setBasicModal={setBasicModal}
            results={results}
            scenarios={scenarios}
            additionalParams={additionalParams}
            setFormData={setFormData}
            formRef={formRef}
            showModal={showModal}
            handleOptChange={handleOptChange}
            setAdditionalParams={setAdditionalParams}
            handleSubmit={handleSubmit}
            handleAdditionalParams={handleAdditionalParams}
            handleCheckboxChange={handleCheckboxChange}
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
            isFormValid={isFormValid}
        />
    )
}

export default RunModelsLogicContainer
