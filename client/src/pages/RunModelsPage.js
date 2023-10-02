import { useState } from "react";
import ToolsNav from "../components/navs/ToolsNav"
import { MDBCheckbox, MDBCol, MDBContainer, MDBInput, MDBRow, MDBBtn, MDBIcon } from "mdb-react-ui-kit"
import axios from "axios";
//import { showSuccessAlert } from "../components/other/Alerts";

const RunModelsPage = () => {

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
        axios.post("http://localhost:8000/scenarios/", formData, { headers })
        .then((res)=>{
            let id = res.data.scenario_id;
            let data = {
                scenario_id: id
            }
            axios.post("http://localhost:8000/test-model", data, {headers})
            .then((res)=>{console.log(res.data)})
            .catch((err)=>{console.log(err)}) 
        })
        .catch(err => console.log(err))
        setFormData(initialFormData);
    };

    const isFormValid = () => {
        const { scenario_name, models, test_p, pred_p } = formData;
        return scenario_name && models.length > 0 && test_p && pred_p;
    };

    return (
        <main style={{"minHeight": "100vh"}} className="bg-white pt-5 pb-5">
            <ToolsNav/>
            <h2 style={{"color": "black"}} className='mb-2 ms-5'>Seleccion de modelos de corrida</h2>
            
            <form className='mb-2 ms-5 mt-3 p-5 border w-75' onSubmit={handleSubmit}>
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
                    <MDBBtn type="submit" className="w-auto d-flex justify-content-center align-items-center gap-2 ms-3" color="primary" disabled={!isFormValid()}>
                        <MDBIcon fas icon="forward" color="white"/>
                        <span>Forecast</span>
                    </MDBBtn>
                </MDBRow>
            </form>
        </main>
    )
}

export default RunModelsPage