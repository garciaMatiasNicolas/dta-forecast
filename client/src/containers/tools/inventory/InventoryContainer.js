import { useEffect, useState } from 'react';
import axios from 'axios';
import { showErrorAlert, } from '../../../components/other/Alerts';
import FilterProductsInventory from '../../../components/admin/tools/inventory/FilterProduct';
import { ClipLoader } from 'react-spinners';
import FiltersNested from '../../../components/admin/tools/inventory/FiltersNested';
import { MDBBtn, MDBInput, MDBRadio } from 'mdb-react-ui-kit';
import TrafficLightContainer from './TrafficLightContainer';
import Navbar from '../../../components/navs/Navbar';

const apiUrl = process.env.REACT_APP_API_URL;

const InventoryContainer = () => {
    const [data, setData] = useState([]);
    const [trafficLight, setTrafficLight] = useState([]);
    const [stockData, setStockData] = useState(false);
    const [loader, setLoader] = useState(false);
    const [stockParams, setStockParams] = useState([]);
    const [showInput, setShowInput] = useState(false);
    const [scenarios, setScenarios] = useState([]);

    const fetchData = (headers, type, params) => {
        axios.post(`${apiUrl}/forecast/stock-data`, 
        {
            project_id: localStorage.getItem("projectId"), 
            order: "", 
            filters: "", 
            type: type,
            params: params
        }, {headers})
        .then(res => {
            setData(res.data.data); 
            //res.data.is_zero && showWariningAlert("El calculo no será preciso, calcule primero el stock de seguridad y vuelva a subir su data", "No hay stock de seguridad");
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
        .then(res => res.data.message === 'stock_data_uploaded' && setStockData(true))
        .catch((err) => {
            err.response.data.error === 'stock_data_not_found' ? showErrorAlert("Debe subir datos de su stock en la plantilla Stock Data"): showErrorAlert(`Error: ${err.response.data.error}`);
            setStockData(false) 
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

        id === "forecast" ? setShowInput(true) : setShowInput(false);

        setStockParams((prev) => ({
            ...prev,
            forecast_or_historical: id
        }));
    };

    const handleForecastPeriods = (e) => {
        if(stockParams.forecast_or_historical === "forecast") {
            setStockParams((prev) => ({
                ...prev,
                forecast_periods: e.target.value
            }));
        } else {
            setStockParams((prev) => ({
                ...prev,
                forecast_periods: ""
            }));
        }
    };

    const handleNextBuy = (e) => {
        setStockParams((prev) => ({
            ...prev,
            next_buy: e.target.value
        }));
    };

    const handleOnClick = () => {
        const token = localStorage.getItem("userToken");
        const headers = {
            'Authorization': `Token ${token}`, 
            'Content-Type': 'application/json', 
        };
        
        setLoader(true);
        fetchData(headers, "stock by product", stockParams);
    };

    const handleOnChange = (event) => {
        setStockParams((prev) => ({
            ...prev,
            scenario_id: event.target.value
        }));
    }; 
        
    return (
        <div>
            <Navbar/>
            <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-center gap-3 align-items-start p-5 bg-white w-100">
                <div className="d-flex flex-column justify-content-start align-items-start gap-3 w-100">

                    {/* <h5 className='text-primary'>Gráfico de Stock por producto</h5>
                    <FilterProductsInventory stock={stockData}/>
                    {!stockData && <p>No hay datos de Stock para este proyecto</p>} */}

                    {/* <div className='d-flex justify-content-center align-items-center w-auto gap-2 mt-5'>
                        <MDBIcon fas icon="angle-double-right" color='primary' />
                        <p style={{'cursor':'pointer'}} onClick={navigateComponents} className='mt-3 text-primary text-decoration-underline'>{!showComponent ? "Calcular stock de seguridad" : "Tabla de stock por producto"}</p>
                    </div> */}

                    <div className="w-100 d-flex justify-content-start align-items-start flex-column gap-3 mb-5 border ps-5 pt-5 pb-5" style={{maxWidth: "800px"}}>
                        <h5 className="text-primary text-center">Parámetros calculo de stock</h5>
                        <div className="w-75 d-flex justify-content-start align-items-center" style={{maxWidth: "500px"}} >    
                            <p className="text-primary mt-3 w-50">Próxima compra:</p>
                            <MDBInput onChange={handleNextBuy} type="text" label="Días" id="next_buy_days"/>
                        </div>


                        <div className="w-50 d-flex justify-content-start align-items-center gap-3">
                            <p className="text-primary mt-3">Data a utilizar:</p>
                            <MDBRadio name="historical_or_forecast" id="historical" label="Histórico" onChange={handleRadioChange}/>
                            <MDBRadio name="historical_or_forecast" id="forecast" label="Predecido"  onChange={handleRadioChange}/>
                        </div>

                        {showInput &&
                            <div>
                                <select className="form-select w-auto" onChange={handleOnChange}>
                                    <option value={false}>Elegir escenario</option>
                                    {scenarios.map((scenario) => (
                                        <option key={scenario.id} value={scenario.id}>{scenario.scenario_name}</option>
                                    ))}
                                </select>
                            </div>
                        }
                        
                        {showInput && <div className="w-75 d-flex justify-content-start align-items-center" style={{maxWidth: "500px"}} >    
                            <p className="text-primary mt-3 w-50">Periodos de forecast:</p>
                            <MDBInput onChange={handleForecastPeriods} type="text" label="Periodos" id="forecast_periods"/>
                        </div>}

                        <MDBBtn onClick={handleOnClick} color="primary" type="button">CALCULAR</MDBBtn>
                    </div>
                    
                    {!loader ? 
                        <FiltersNested data={data} params={stockParams} /> 
                        : 
                        <div className='d-flex flex-column justify-content-start align-items-start w-auto gap-2'>  
                            <h5 className='text-primary'>Tabla de stock por producto</h5>
                            <ClipLoader/>
                        </div>
                    }

                    {!loader ? 
                        <TrafficLightContainer data={trafficLight} /> 
                        : 
                        <div className='d-flex flex-column justify-content-start align-items-start w-auto gap-2'>  
                            <h5 className='text-primary'>Tabla de stock por producto</h5>
                            <ClipLoader/>
                        </div>
                    }
                        
                    {/*   :  
                    <>
                        <h5 className='text-primary'>Calcular stock de seguridad</h5>
                        <SafetyStock fetchData={fetchData}/> 
                    </> */}
                    
                </div>
            </main>
        </div>
    );
}

export default InventoryContainer;