import { useEffect, useState } from 'react';
import axios from 'axios';
import { showErrorAlert, } from '../../../components/other/Alerts';
import { ClipLoader } from 'react-spinners';
import FiltersNested from '../../../components/admin/tools/inventory/FiltersNested';
import { MDBBtn, MDBInput, MDBRadio } from 'mdb-react-ui-kit';
import Navbar from '../../../components/navs/Navbar';
import NavInventory from '../../../components/navs/NavInventory';

const apiUrl = process.env.REACT_APP_API_URL;

const DrpContainer = () => {
    const [data, setData] = useState([]);
    const [trafficLight, setTrafficLight] = useState([]);
    const [loader, setLoader] = useState(false);
    const [scenarioId, setScenarioId] = useState(null);
    
    const [stockParams, setStockParams] = useState({
        next_buy: "15",
        forecast_or_historical: "historical",
        forecast_periods: "3", 
        purchase_cost: "3000",
        purchase_perc: "28",
        historical_periods: "3",
        scenario_id: false,
    });
    const [scenarios, setScenarios] = useState([]);

    const fetchData = (headers, type, params) => {
        axios.post(`${apiUrl}/forecast/stock-data/?drp=true`, 
        {
            project_id: localStorage.getItem("projectId"), 
            type: type,
            params: params
        }, {headers})
        .then(res => {
            setData(res.data.data); 
            setTrafficLight(res.data.traffic_light);
        })
        .catch(err => {
            if(err.response.data.error === "data_none") {showErrorAlert("No hay datos históricos")}
            else if(err.response.data.error === "stock_data_none")  {showErrorAlert("No hay datos de Stock")}
            else if(err.response.data.error === "stock_hsd_dif_len")  {showErrorAlert("Hay mas productos en tu planilla de stock que en la historica")}
            else {showErrorAlert("Ocurrio un error inesperado")}
        })
        .finally(() => {setLoader(false)});
    };

    useEffect(()=> {
        // AUTHORIZATION HEADERS //
        const token = localStorage.getItem("userToken");
        const headers = {
            'Authorization': `Token ${token}`, 
            'Content-Type': 'application/json', 
        };

        axios.get(`${apiUrl}/forecast/stock-product/?project_id=${localStorage.getItem("projectId")}`, {headers})
        .catch((err) => {
            err.response.data.error === 'stock_data_not_found' ? showErrorAlert("Debe subir datos de su stock en la plantilla Stock Data"): showErrorAlert(`Error: ${err.response.data.error}`);
        });

        // Get all scenarios and set state on first render
        axios.get(`${apiUrl}/scenarios/`, {
            headers:headers
        })
        .then(res => {
            let projectId = parseInt(localStorage.getItem("projectId"))
            let scenarios = res.data.filter(item => item.project === projectId);
            setScenarios(scenarios);
        }).catch(err => {
            console.log(err);
        })

    }, []);

    const handleRadioChange = (e) => {
        let { id } = e.target;

        setStockParams((prev) => ({
            ...prev,
            forecast_or_historical: id
        }));
    };

    const handlePeriods = (e, type) => {
        if(type === "forecast") {
            setStockParams((prev) => ({
                ...prev,
                forecast_periods: e.target.value
            }));
        } else {
            setStockParams((prev) => ({
                ...prev,
                historical_periods: e.target.value
            }));
        }
    };

    const handleNextBuy = (e) => {
        setStockParams((prev) => ({
            ...prev,
            next_buy: e.target.value
        }));
    };

    const handleOptimalBatchParams = (e, type) => {

        if(type === "perc") {
            setStockParams((prev) => ({
                ...prev,
                purchase_perc: e.target.value
            }));
        } else {
            setStockParams((prev) => ({
                ...prev,
                purchase_cost: e.target.value
            }));
        }
    }

    const handleOnClick = () => {
        const token = localStorage.getItem("userToken");
        const headers = {
            'Authorization': `Token ${token}`, 
            'Content-Type': 'application/json', 
        };
        
        if (stockParams["forecast_or_historical"] === "forecast" ){
            if (stockParams["scenario_id"] === false) { showErrorAlert("Si elige predecido, debe seleccionar un escenario"); }
            else if (stockParams["forecast_periods"] === "0") { showErrorAlert("Si elige predecido, los periodos de forecast no pueden ser cero"); }
            else {
                setLoader(true);
                fetchData(headers, "stock by product", stockParams);
            };
        } else {
            setLoader(true);
            fetchData(headers, "stock by product", stockParams);
        }
    };

    const handleOnChange = (event) => {
        let value = event.target.value === "false" ? false : event.target.value;
        setStockParams((prev) => ({
            ...prev,
            scenario_id: value
        }));
        setScenarioId(value)
    }; 
        
    return (
        <div>
            <Navbar/>
            <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-center gap-3 align-items-start p-5 bg-white w-100">
                <NavInventory/>
                <div className="d-flex flex-column justify-content-start align-items-start gap-3 w-100">

                    <div className="w-100 d-flex justify-content-start align-items-start flex-column gap-3 mb-5 border ps-5 pt-5 pb-5" style={{maxWidth: "800px"}}>
                        <h5 className="text-primary text-center">Parametros de cálculo DRP por sucursal</h5>
                        <div className="w-75 d-flex justify-content-start align-items-center" style={{maxWidth: "500px"}} >    
                            <p className="text-primary mt-3 w-50">Próxima compra:</p>
                            <MDBInput onChange={handleNextBuy} type="text" label="Días" id="next_buy_days" defaultValue={15}/>
                        </div>

                        <div className="w-75 d-flex justify-content-start align-items-center" style={{maxWidth: "500px"}} >    
                            <p className="text-primary mt-3 w-50">Costo de compra:</p>
                            <MDBInput onChange={(e)=>{handleOptimalBatchParams(e, "cost")}} type="text" label="Costo" id="purchase_cost" defaultValue={3000}/>
                        </div>

                        <div className="w-75 d-flex justify-content-start align-items-center" style={{maxWidth: "500px"}} >    
                            <p className="text-primary mt-3 w-50">Porcentaje anual:</p>
                            <MDBInput onChange={(e)=>{handleOptimalBatchParams(e, "perc")}} type="text" label="Porcentaje" id="purchase_perc" defaultValue={28}/>
                        </div>

                        <div className="w-50 d-flex justify-content-start align-items-center gap-3">
                            <p className="text-primary mt-3">Data a utilizar:</p>
                            <MDBRadio name="historical_or_forecast" id="historical" label="Histórico" onChange={handleRadioChange} defaultChecked/>
                            <MDBRadio name="historical_or_forecast" id="forecast" label="Predecido"  onChange={handleRadioChange}/>
                        </div>

                        <div>
                            <select className="form-select w-auto" onChange={handleOnChange}>
                                <option value={false}>Elegir escenario</option>
                                {scenarios.map((scenario) => (
                                    <option key={scenario.id} value={scenario.id}>{scenario.scenario_name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="w-75 d-flex justify-content-start align-items-center" style={{maxWidth: "500px"}} >    
                            <p className="text-primary mt-3 w-50">Periodos históricos:</p>
                            <MDBInput onChange={(e) => handlePeriods(e, "historical")} type="text" label="Periodos" id="historical_periods" defaultValue={3}/>
                        </div>
                        
                        <div className="w-75 d-flex justify-content-start align-items-center" style={{maxWidth: "500px"}} >    
                            <p className="text-primary mt-3 w-50">Periodos de forecast:</p>
                            <MDBInput onChange={(e) => handlePeriods(e, "forecast")} type="text" label="Periodos" id="forecast_periods" defaultValue={3}/>
                        </div>

                        <MDBBtn onClick={handleOnClick} color="primary" type="button">CALCULAR</MDBBtn>
                    </div>
                    
                    {!loader ? 
                        <FiltersNested data={data} stockParams={stockParams} trafficLight={trafficLight} scenario={scenarioId} is_drp={true}/> 
                        : 
                        <div className='d-flex flex-column justify-content-start align-items-start w-auto gap-2'>  
                            <ClipLoader/>
                        </div>
                    }
                    
                </div>
            </main>
        </div>
    );
}

export default DrpContainer;