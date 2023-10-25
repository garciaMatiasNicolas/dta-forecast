import { MDBRow } from "mdb-react-ui-kit"; 
import TableMape from "../../../components/admin/tools/reports/TableMape";
import { useEffect, useState } from "react";
import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

const MetricsByDateContainer = () => {

  // AUTHORIZATION HEADERS //
  const token = localStorage.getItem("userToken");
  const headers = {
    'Authorization': `Token ${token}`, 
    'Content-Type': 'application/json', 
  };

  const [scenarios, setScenarios] = useState([]);
  const [dates, setDates] = useState([]);
  const [scenarioId, setScenarioId] = useState(0);
  const [data, setData] = useState([]);

  const handleOnChangeScenario = (e) =>{
    let id = e.target.value;
    setScenarioId(id);
    const data = {
      filter_name: 'date',
      scenario_id: id,
      project_id: localStorage.getItem("projectId"),
      filter_value: "x"
    };

    axios.post(`${apiUrl}/get-filters`, data, {headers})
    .then(res => {setDates(res.data);})
    .catch((err) => {setDates([]); console.log(err)} );
  }

  const handleOnChangeDates = (e) => {
    let date = e.target.value;
    const data = {
      filter_name: 'date',
      scenario_id: scenarioId,
      project_id: localStorage.getItem("projectId"),
      filter_value: date
    };

    axios.post(`${apiUrl}/report-mape-date`, data,{headers})
    .then(res => {setData(res.data)})
    .catch(res => {console.log(res)})
  }

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

  return (
    <div className="w-100 px-3 gap-5">
      <MDBRow className="d-flex justify-content-start align-items-start">
        <div className="w-50 d-flex flex-column justify-content-center align-items-start gap-1">
          <p className="text-primary w-auto m-0 p-0">Seleccionar Escenario</p>
          <select className="form-select w-100 mt-2" style={{"maxWidth": "250px"}} onChange={handleOnChangeScenario}>
            <option value={0}>-----</option>
            {scenarios.map(item => (
              <option key={item.id} value={item.id}>{item.scenario_name}</option>
            ))}
          </select>
        </div>
        <div className="w-50 d-flex flex-column justify-content-center align-items-end gap-1">
          <p className="text-primary w-auto m-0 ms-1 p-0">Seleccionar Fecha</p>
          <select onChange={handleOnChangeDates} className="form-select w-100 mt-2" style={{"maxWidth": "250px"}}>
            <option value={0}>-----</option>
            {dates.map(date=>(<option value={date}>{date}</option>))}
          </select>
        </div>
      </MDBRow>
      <MDBRow className="mt-5">
        <p className="text-primary w-auto m-0 p-0">Reporte de metricas por fecha seleccionada</p>
        <TableMape data={data}/>
      </MDBRow>
    </div>
  )
}

export default MetricsByDateContainer