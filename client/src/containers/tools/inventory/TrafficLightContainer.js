import { useState } from "react";
import Table from "../../../components/admin/tools/inventory/TableWithAvg";
import TrafficLightChart from "../../../components/admin/tools/inventory/TrafficLightChart";
import { MDBBtn } from "mdb-react-ui-kit";
import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

const TrafficLightContainer = ({data}) => {
    const [dataSeted, setData] = useState(data);
    const [filterName, setFilterName] = useState("");
    const [filterValue, setFilterValue] = useState("");

    if (!data || data.length === 0) {
        return <div></div>;
    };

  
    const handleFilterTrafficLight = () => {

        axios.post(`${apiUrl}/forecast/stock-data/?only_traffic_light=true&filter_name=${filterName}&filter_value=${filterValue}`, 
        {
            project_id: localStorage.getItem("projectId"), 
            order: "", 
            filters: "", 
            type: "",
            params: ""
        }, {})
    };

    return (
        <> 
            <h5 className='text-primary mt-5'>Semáforo de stock</h5>
            
            <div className="d-flex justify-content-center align-items-center w-auto gap-3">
                <select className="form-select w-auto border border-0">
                    <option>Familia</option>
                    <option>Region</option>
                    <option>Categoria</option>
                    <option>Subcategoria</option>
                    <option>Cliente</option>
                    <option>Vendedor</option>
                </select>

                <MDBBtn onClick={handleFilterTrafficLight}>Filtrar</MDBBtn>
            </div>


            <Table data={data} />
            <div style={{ width: '800px', height: '400px' }} className="mb-5">
                <TrafficLightChart data={dataSeted} />
            </div>
        </>
    )
};

export default TrafficLightContainer;