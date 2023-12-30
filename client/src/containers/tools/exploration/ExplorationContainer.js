import React, { useEffect, useState } from 'react'
import { MDBInput } from 'mdb-react-ui-kit'
import axios from 'axios';
import GraphExploration from '../../../components/admin/tools/exploration/GraphExploration';
import GraphAllocationMatrix from '../../../components/admin/tools/exploration/GraphAllocationMatrix';
import Swal from 'sweetalert2';
import Outliers from '../../../components/admin/tools/exploration/Outliers';

const apiUrl = process.env.REACT_APP_API_URL;
const filtersMatrix = ['Family', 'Region', 'Salesman', 'Client', 'Category', 'Subcategory', 'SKU']

const ExplorationContainer = () => {
  // AUTHORIZATION HEADERS //
  const token = localStorage.getItem("userToken");
  const headers = {
    'Authorization': `Token ${token}`, 
    'Content-Type': 'application/json', 
  };
  
  // States for correlation matrix
  const [correlationMatrix, setCorrelationMatrix] = useState("");
  const [showVariable, setShowVariable] = useState(false);
  const [showSearchSku, setShowSearchSku] = useState(false);
  const [variablesNames, setVariablesNames] = useState([]);
  const [filterCorrelation, setFilterCorrelation] = useState("");

  // USE EFFECT //
  useEffect(() => {
    const data = {
      project_id: localStorage.getItem("projectId")
    }

    axios.post(`${apiUrl}/get-vars-names`, data, {
      headers: headers
    })
    .then(res => {
      setVariablesNames(res.data);
    })
    .catch(err => {
      console.log(err);
    })
  }, []);

  const handleOnClickFilterCorrelation = (e) =>{
    setShowVariable(true); 
    setShowSearchSku(false);
    setFilterCorrelation(e.target.value); 
  }

  const handleOnChangeVar = (e) => {
    const correlationData = {
      project_id: localStorage.getItem("projectId"),
      filter_value: filterCorrelation,
      exog_variable: e.target.value
    }

    axios.post(`${apiUrl}/correlation-matrix`, correlationData, {
      headers: headers
    })
    .then(res => {
      setCorrelationMatrix(res.data);
    })
    .catch(err => {
      if(err.response.data.error === 'not_exog_data'){setCorrelationMatrix("")}
      if(err.response.data.error === 'exog_var_not_apply'){
        Swal.fire({
          icon: 'warning',
          title:  "Alerta!",
          text: "La variable exógena seleccionada no corresponde a el filtro seleccionado",
        });
      }
    })
    .finally(()=>{
      setShowVariable(false);
      document.getElementById("select-filter").value ="first";
    })
  }

  return (
    
    <div className='w-100 d-flex justify-content-start align-items-start gap-2 flex-column px-5' >

      <GraphExploration />
      <div className='w-100 d-flex justify-content-start align-items-start gap-2 flex-column '>
        <Outliers/>

        <div className='d-flex flex-column justify-content-start align-items-start gap-3 mt-5'>
          <h5 className='text-primary'>Gráfico de correlación de Variables exógenas</h5>
          
          <div className='d-flex justify-content-center align-items-center gap-5 mb-5'>
            <div className='d-flex justify-content-center align-items-center gap-2'>
              <p className='mt-3 text-primary'>Filtrar por:</p>
              <select id='select-filter' className='form-select w-auto' onChange={handleOnClickFilterCorrelation} >
                <option value="first" defaultValue>-----</option>
                {filtersMatrix.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            { showVariable &&
              <div className='d-flex justify-content-center align-items-center gap-2'>
                <p className='mt-3 text-primary'>Variable:</p>
                <select className='form-select w-auto' onChange={handleOnChangeVar}>
                  <option defaultValue>-----</option>
                  {variablesNames.map((item, index) =>(
                    <option key={index} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            }
            
            { showSearchSku &&
              <div className='d-flex justify-content-center align-items-center gap-2 w-auto'>
                <p className='mt-3 text-primary'>SKU:</p>
                <MDBInput label='SKU'/>
              </div>
            }
          </div>
          { correlationMatrix !== "" && <GraphAllocationMatrix correlationMatrix={correlationMatrix}/> }
        </div>
      </div>
    </div>
  )
}

export default ExplorationContainer