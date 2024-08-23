import { useState, useEffect } from "react";
import GraphModels from "./GraphModels";
import axios from "axios";
import {
    MDBBtn,
    MDBModal,
    MDBModalDialog,
    MDBModalContent,
    MDBModalHeader,
    MDBModalTitle,
    MDBModalBody,
    MDBModalFooter,
    MDBIcon
} from 'mdb-react-ui-kit';

const apiUrl = process.env.REACT_APP_API_URL;
const GraphicBySku = () => {
    
    // AUTHORIZATION HEADERS //
    const token = localStorage.getItem("userToken");
    const headers = {
        'Authorization': `Token ${token}`, 
        'Content-Type': 'application/json', 
    };

    const [basicModal, setBasicModal] = useState(false);
    const [scenarios, setScenarios] = useState([]);
    const [dataModelGraph, setDataModelGraph] = useState({"models": 0, "avg": 0});
    const [scenarioId, setScenarioId] = useState(0);

    useEffect(() => {
        axios.get(`${apiUrl}/scenarios/`, {
          headers: headers
        })
        .then(res => { 
          let projectId = parseInt(localStorage.getItem("projectId"))
          let scenarios = res.data.filter(item => item.project === projectId);
          setScenarios(scenarios);
        })
        .catch(err => {console.log(err);})
    }, []);

    // Function to get graphic data 
    const handleGraphicDataModels = (scId) => { 
        const data = {
        "scenario_id": scId,
        }

        axios.post(`${apiUrl}/forecast/graphic-model`, data, {headers})
        .then(res => setDataModelGraph(res.data))
        .catch(err => console.log(err)); 
    };

    const toggleOpen = () => setBasicModal(!basicModal);

    return(
        <div className="w-100 px-3 gap-5 d-flex justify-content-start flex-column align-items-start">
            
            <div className="w-auto d-flex flex-column justify-content-center align-items-start gap-1">
                <p className="text-primary w-auto m-0 p-0">Seleccionar Escenario</p>
                <select className="form-select w-100 mt-2" style={{"maxWidth": "250px", "minWidth":"200px"}}>
                    <option value={0}>-----</option>
                    {scenarios.map(item => (
                    <option key={item.id} value={item.id}>{item.scenario_name}</option>
                    ))}
                </select>
            </div>

            <MDBBtn onClick={toggleOpen} className="w-auto d-flex justify-content-center align-items-center gap-2">
                <span className="text-white">Elegir producto</span>
                <MDBIcon color="white" fas icon="key" />
            </MDBBtn>
            

            <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1'>           
                <MDBModalDialog>
                    <MDBModalContent>
                        <MDBModalHeader>
                            <MDBModalTitle>Productos</MDBModalTitle>
                            <MDBBtn className='btn-close' color='none' onClick={toggleOpen}></MDBBtn>
                        </MDBModalHeader>
                        <MDBModalBody>...</MDBModalBody>
                    </MDBModalContent>
                </MDBModalDialog>
            </MDBModal>


            <GraphModels scenario={scenarioId} graphicData={dataModelGraph}/>

        </div>
    )
};

export default GraphicBySku;