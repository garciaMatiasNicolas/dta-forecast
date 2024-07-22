import { useEffect, useState } from "react";
import Table from "../../../components/admin/tools/inventory/TableWithAvg";
import TrafficLightChart from "../../../components/admin/tools/inventory/TrafficLightChart";
import { MDBBtn } from "mdb-react-ui-kit";
import axios from "axios";
import { showErrorAlert } from "../../../components/other/Alerts";

const apiUrl = process.env.REACT_APP_API_URL;

const TrafficLightContainer = ({data, params}) => {
    const [dataFiltered, setDataFiltered] = useState([]);
    const [filterName, setFilterName] = useState("");
    const [initialData, setInitialData] = useState(data ||[]);
    const [filterValue, setFilterValue] = useState("");
    const [options, setOptionsFilter] = useState([]);
    const [isOnlyTL, setIsOnlyTl] = useState(false);
    
    useEffect(()=> {
        setInitialData(data || []);
    }, []);

    if (!data || data.length === 0) {
        return <div></div>;
    };

    // AUTHORIZATION HEADERS //
    const token = localStorage.getItem("userToken");
    const headers = {
        'Authorization': `Token ${token}`, 
        'Content-Type': 'application/json', 
    };

    const handleFilterTrafficLight = () => {
        setIsOnlyTl(true);
        axios.post(`${apiUrl}/forecast/stock-data/?only_traffic_light=true&filter_name=${filterName}&filter_value=${filterValue}`, 
        {
            project_id: localStorage.getItem("projectId"), 
            order: "", 
            filters: "", 
            type: "stock by product",
            params: params
        }, {headers})
        .then(res => setDataFiltered(res.data || []))
        .catch(err => showErrorAlert("Ocurrio un error al filtrar el semaforo"))
    };

    const handleFilterChange = (event) => {
        const selectedFilter = event.target.value;
        setFilterName(selectedFilter);
    };

    // Function for get filters from server
    const handleClickFilter = (e) => {
        const data = {
            filter_name: e.target.value,
            scenario_id: params["scenario_id"],
            project: localStorage.getItem("projectId") ,
            filter_value: "x"
        };

        axios.post(`${apiUrl}/forecast/get-filters-historical`, data, { headers })
        .then(res => setOptionsFilter(res.data))
        .catch(err => console.log(err));
    };

    const handleOnChangeFilterValue = (e) => {
        const selectedFilter = e.target.value;
        setFilterValue(selectedFilter);
    };

    return (
        <> 
            
            <div className="d-flex justify-content-center align-items-center w-auto gap-3">
                <select className="form-select w-auto border border-0" onChange={handleFilterChange} onClick={handleClickFilter}>
                    <option>-----</option>
                    <option value="Family">Familia</option>
                    <option value="Region">Region</option>
                    <option value="Category">Categoria</option>
                    <option value="Subcategory">Subcategoria</option>
                    <option value="Client">Cliente</option>
                    <option value="Salesman">Vendedor</option>
                </select>

                <select className="form-select w-auto border border-0" onChange={handleOnChangeFilterValue}>
                    <option>-----</option>
                    {options.map(opt => 
                        <option value={opt} key={opt}>{opt}</option>
                    )}
                </select>

                <MDBBtn onClick={handleFilterTrafficLight}>Filtrar</MDBBtn>
            </div>


            <Table data={ !isOnlyTL ? initialData : dataFiltered.traffic_light} /> 
            {/* <div style={{ width: '800px', height: '400px' }} className="mb-5">
                <TrafficLightChart data={dataSeted} isOnlyTL={isOnlyTL}/>
            </div> */}
        </>
    )
};

export default TrafficLightContainer;