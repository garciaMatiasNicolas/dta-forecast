import axios from "axios";
import { MDBBtn, MDBInput } from "mdb-react-ui-kit";
import { useEffect, useState } from "react";
import GraphStockByProduct from "./StockByProductGraph";
import { ClipLoader } from "react-spinners";
import { showErrorAlert } from "../../../other/Alerts";

const apiUrl = process.env.REACT_APP_API_URL;

const FilterProductsInventory = ({stock}) => {
    const token = localStorage.getItem("userToken");
    
    // STATES //
    const [scenarios, setScenarios] = useState([]);
    const [scenarioSelected, setScenarioSelected] = useState(null);
    const [loader, setLoader] = useState(false);
    const [skuValue, setSkuValue] = useState("");
    const [data, setData] = useState({});
    const [renderGraph, setRenderGraph] = useState(false);
    
    // USE EFFECT //
    useEffect(() => {
        // Get all scenarios and set state on first render
        axios.get(`${apiUrl}/scenarios/`, {
            headers: {
                'Authorization': `Token ${localStorage.getItem("userToken")}`, 
                'Content-Type': 'application/json', 
            }
        })
        .then(res => {
            let projectId = parseInt(localStorage.getItem("projectId"))
            let scenarios = res.data.filter(item => item.project === projectId);
            setScenarios(scenarios);
        }).catch(err => {
            console.log(err);
        })
    }, []);

    // EVENTS //
    const handleOnChange = (event) => {
        setScenarioSelected(event.target.value);   
    }; 


    const fetchDataGraph = async (body) => {
        try {
            const response = await axios.post(`${apiUrl}/forecast/stock-product/`, body, {headers: {
                'Authorization': `Token ${token}`, 
                'Content-Type': 'application/json', 
            }});
            setData(response.data);
            setRenderGraph(true);
        } catch (err) {
            err.response.data.error === 'sku_not_found' && showErrorAlert("SKU no encontrado");
            err.response.data.error === 'multiple_products_with_the_same_sku' && showErrorAlert("Existe mas de un producto con el mismo SKU")
        } finally{ 
            setLoader(false);
        }

    }

    const handleSubmit = (event) => {
        event.preventDefault();
        setLoader(true);
        
        // Fetch data for sku
        const body = {
            scenario_id: scenarioSelected,
            project_id: localStorage.getItem("projectId"),
            sku: skuValue
        }

        fetchDataGraph(body);
        setSkuValue("");
    }

    return (
        <div className="d-flex flex-column justify-content-start align-items-center gap-5"> 
            <div className='d-flex justify-content-start align-items-center w-100 gap-4'>
                <div>
                    <select className="form-select w-auto" onChange={handleOnChange} disabled={!stock}>
                        <option value={false}>Elegir escenario</option>
                        {scenarios.map((scenario) => (
                            <option key={scenario.id} value={scenario.id}>{scenario.scenario_name}</option>
                        ))}
                    </select>

                </div>
                
                <form onSubmit={handleSubmit} className="w-auto d-flex justify-content-center align-items-center gap-2">
                    <MDBInput
                        type="text"
                        label="SKU"
                        className="w-auto"
                        disabled={!stock || !scenarioSelected}
                        value={skuValue}
                        onChange={(e) => setSkuValue(e.target.value)}
                    />

                    <MDBBtn 
                        className="bg-primary w-100"
                        disabled={!stock || !scenarioSelected}
                        type="submit"
                    > Buscar
                    </MDBBtn>
                </form>
            </div>

            {loader ? <ClipLoader /> : (renderGraph && <GraphStockByProduct data={data.data} sku={skuValue} />)}          
        </div>
    );
}

export default FilterProductsInventory;