import axios from "axios";
import AdvancedParamsContainer from "../../containers/tools/params/AdvancedParamsContainer";
import BasicParams from "../../containers/tools/params/BasicParams"
import ToolsNav from "../../components/navs/ToolsNav";
import ScenarioSaving from "../../containers/tools/params/ScenarioSaving";
import RunModelsButton from "../../components/admin/tools/RunModelsButton";
import { useState, useEffect } from "react";
import { showErrorAlert, showSuccessAlert } from "../../components/other/Alerts";
import { MDBContainer, MDBRow, MDBCol, MDBBtn, MDBModal, MDBModalDialog, MDBModalContent, MDBModalBody, MDBModalFooter, MDBIcon} from 'mdb-react-ui-kit';
import { ClipLoader } from "react-spinners";

const apiUrl = process.env.REACT_APP_API_URL;

const ParamsPage = () => {
  // Token and headers
  const token = localStorage.getItem("userToken");
  const project = localStorage.getItem("projectId");
  const headers = {
    'Authorization': `Token ${token}`, 
    'Content-Type': 'application/json', 
  };

  // States
  const [scenario, setScenario] = useState([]);

  const [choosedScenario, setChoosedScenario] = useState("Crear nuevo escenario");

  const [scenarioData, setScenarioData] = useState(undefined);

  const [basicModal, setBasicModal] = useState(false);

  const [runScenario, setRunScenario] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  // Get scenarios names in first render
  useEffect(() => {
    const data = {
      "project": project
    };

    axios.post(`${apiUrl}/scenarios/get_scenario_names/`, data, { headers })
    .then(res => {
      res.data.not_found ? setScenario("No hay escenarios") : setScenario(res.data)
    })
    .catch(err => {
      showErrorAlert("Ocurrio un error");
    });
    
  }, []);

  // Get data from scenario
  const getScenarioData = (value) => {
    setChoosedScenario(value);

    const data = {
      "pk" : value
    }

    axios.post(`${apiUrl}/scenarios/get_scenario_data/`, data, { headers })
    .then(res => setScenarioData(res.data[0]));

    if (scenarioData === undefined ){
      setBasicModal(!basicModal);
    }
  }

  // Run scenario saved
  const handleClickScenarioSaved = () => {
    setRunScenario(true);
    
    const data = {
      "test_p": parseInt(scenarioData.test_p),
      "pred_p": parseInt(scenarioData.pred_p),
      "project_name": localStorage.getItem("projectName"),
      "user_owner": localStorage.getItem("userPk")
    }
    
    axios.post(`${apiUrl}/test-model`, data, { headers })
    .then(()=>{
      setBasicModal(false);
      setIsLoading(false);
      showSuccessAlert("Modelos corridos exitosamente", "Forecast finalizado");
    })
    .catch(() => {
      setBasicModal(false);
      setIsLoading(false);
      showErrorAlert("Ocurrio un error inesperado, intente mas tarde");
    })
    
  };

  return (
    <main style={{"minHeight": "100vh"}} className="bg-white pt-5 pb-5">
      <ToolsNav/>
      <form>
        <MDBContainer className="mb-5 mt-4">
          <h5>Elegir escenario existente</h5>
          <MDBRow className="w-100 d-flex justify-content-between align-items-center ms-1">
            <select className="form-select w-50" onChange={(e)=> {
              getScenarioData(e.target.value);
            }}>
              {
                typeof scenario === 'string' ? 
                <>
                  <option defaultValue>Crear nuevo escenario</option>
                  <option disabled>---</option>
                </>
                :
                scenario.map((scenario) => (
                  <>
                    <option defaultValue>Crear nuevo escenario</option>
                    <option value={scenario.id}>
                      {scenario.scenario_name}
                    </option>
                  </>
                ))
              }
            </select>
          </MDBRow>
          
          <div style={{"marginTop": "15px"}} className={choosedScenario !== "Crear nuevo escenario" && 'disabled-div'}>
            <RunModelsButton/>
          </div> 

        </MDBContainer>
        
        <MDBContainer className={choosedScenario !== "Crear nuevo escenario" && 'disabled-div'}>

          <MDBRow>
            <MDBCol size='lg'>
              <BasicParams props={scenarioData}/>
            </MDBCol>
            
            <MDBCol size='lg'>
              <ScenarioSaving/>
            </MDBCol>
          </MDBRow>

          <MDBRow className="mt-5">
            <MDBCol>
              <AdvancedParamsContainer/>
            </MDBCol>
          </MDBRow>

        </MDBContainer>
      </form>

      {/* If scenarioData is not undefined, show this modal */ }
      <>
      <MDBModal staticBackdrop  show={basicModal} setShow={setBasicModal} tabIndex='-1'>
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalBody>
              {
                !runScenario ? 
                <>
                  {scenarioData !== undefined &&  <h5 className="fw-bold">¿Desea ejecutar la corrida con el escenario "{scenarioData.scenario_name}"?</h5>}
                  {
                    scenarioData !== undefined && 
                    <div className="mt-3">
                      <p>Correr modelo: {scenarioData.run_mode}</p>
                      <p>Dimensiones de arriba abajo: {scenarioData.top_down_dimensions}</p>
                      <p>Interpolar ceros: {scenarioData.interpolate_zeros}</p>
                      <p>Interpolar negativos: {scenarioData.interpolate_negatives}</p>
                      <p>Metodos de interpolacion: {scenarioData.interpolation_methods}</p>
                      <p>Deteccion de valores atipicos: {scenarioData.outliers_detection}</p>
                    </div>
                  }
                </>
                :
                <div className="d-flex justify-content-center align-items-center flex-column gap-2">
                  { isLoading && <ClipLoader color="#2b9eb3" size={50} /> }
                  <h5 >Corriendo modelos...</h5>
                </div>
              }
            </MDBModalBody>

            <MDBModalFooter>
              <MDBBtn disabled={!runScenario ? false : true} color='secondary' onClick={()=>{
                setBasicModal(!basicModal);
                window.location.reload();
              }}>
                Volver a crear escenario
              </MDBBtn>

              <MDBBtn onClick={handleClickScenarioSaved} type="submit" className="w-auto d-flex justify-content-center align-items-center gap-2" color="primary">
                <MDBIcon fas icon="forward" color="white"/>
                <span>Forecast</span>
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </>
    </main>
  )
}

export default ParamsPage