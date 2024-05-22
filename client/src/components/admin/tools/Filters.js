import { useState } from "react";
import { filters } from "../../../data/filters";
import axios from "axios";
import { MDBIcon } from "mdb-react-ui-kit";

const apiUrl = process.env.REACT_APP_API_URL;

const Filters = ({handleOnChangeFilter, scenario, conditions}) => {
  // AUTHORIZATION HEADERS //
  const token = localStorage.getItem("userToken");
  const headers = {
    'Authorization': `Token ${token}`, 
    'Content-Type': 'application/json', 
  };
  
  // State for get filters from server
  const [optionsFilter, setOptionsFilter] = useState([]);

  // Function for get filters from server
  const handleClickFilter = (e) => {
    const data = {
      filter_name: e.target.name,
      scenario_id: scenario,
      project_id: localStorage.getItem("projectId") ,
      filter_value: "x", 
      conditions: conditions
    };

    axios.post(`${apiUrl}/forecast/get-filters`, data, { headers })
    .then(res => setOptionsFilter(res.data))
    .catch(err => console.log(err));
  };

  return (
  filters.map(item => (
      <div className='w-100'>
        <div className="d-flex justify-content-start align-items-center gap-3">
          <MDBIcon icon={item.icon}/>
          <p className="mt-3">{item.label}</p>
        </div>
        <select 
          onClick={handleClickFilter} onChange={handleOnChangeFilter}  
          style={{
            minWidth: '200px'
          }} 
          className="form-select w-100" 
          name={item.name}
        >
          <option defaultValue>-----</option>
          {optionsFilter.map(item => (
            <option value={item} >{item}</option>
          ))}
        </select>
      </div>
  ))
)
}

export default Filters
