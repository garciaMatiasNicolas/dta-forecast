import axios from 'axios';
import { MDBIcon, MDBTable, MDBTableBody, MDBTableHead } from 'mdb-react-ui-kit';
import { useEffect, useState } from 'react';
import { showErrorAlert } from '../../../other/Alerts';
import { ClipLoader } from 'react-spinners';
import { filters } from '../../../../data/filters';

const apiUrl = process.env.REACT_APP_API_URL;
const GraphAllocationMatrix = () => {
  
  // AUTHORIZATION HEADERS //
  const token = localStorage.getItem("userToken");
  const headers = {
    'Authorization': `Token ${token}`, 
    'Content-Type': 'application/json', 
  };

  const [variablesNames, setVariablesNames] = useState([]);
  const [dataAllocationMatrix, setDataAllocationMatrix] = useState([]);
  const [loader, setLoader] = useState(false);
  const [optionsFilter, setOptionsFilter] = useState([]);

  const newFilters = filters.filter(item=> item.name !== "SKU");

  useEffect(() => {
    const data = {
      project_id: localStorage.getItem("projectId")
    }
    
    axios.post(`${apiUrl}/forecast/get-vars-names`, data, { headers: headers})
    .then(res => {
      setVariablesNames(res.data);
      
      setLoader(true);

      axios.post(`${apiUrl}/forecast/correlation-matrix`, data, {headers:headers})
      .then(res => setDataAllocationMatrix(res.data))
      .catch(() => showErrorAlert("Error al caclular la matriz de correlación"))
      .finally(() => setLoader(false));
    })
    .catch(err => err.response.data.error === 'not_exog_data' && setVariablesNames(false));
    
  }, []);

  const handleOnclickFilter = (e) => {
    const data = {
      filter_name: e.target.name,
      project: localStorage.getItem("projectId")
    };

    axios.post(`${apiUrl}/forecast/get-filters-historical`, data, { headers })
    .then(res => setOptionsFilter(res.data))
    .catch(() => showErrorAlert("Error en el servidor"));
  };

  const handleOnChangeFilter = (e) => {
    setLoader(true);

    const data = {
      group: e.target.name,
      group_val: e.target.value,
      project_id: localStorage.getItem("projectId")
    }

    axios.post(`${apiUrl}/forecast/correlation-matrix`, data, {headers:headers})
    .then(res => setDataAllocationMatrix(res.data))
    .catch(() => showErrorAlert("Error al caclular la matriz de correlación"))
    .finally(() => setLoader(false));
  };

  return (
    <div className='d-flex justify-content-start align-items-start flex-column'>
      { variablesNames &&
        <div className='w-100 d-flex justify-content-center align-items-center gap-1 mt-2 flex-wrap'>
          {newFilters.map(item => (
            <div className='w-auto'>
            <div className="d-flex justify-content-start align-items-center gap-3">
                <MDBIcon color='primary' icon={item.icon}/>
                <p className="mt-3 text-primary">{item.label}</p>
            </div>
            <select 
                style={{
                minWidth: '200px'
                }} 
                className="form-select w-100" 
                name={item.name}
                onClick={handleOnclickFilter}
                onChange={handleOnChangeFilter}
            >
                <option defaultValue>-----</option>
                {optionsFilter.map(item => (
                  <option key={item} value={item} >{item}</option>
                ))}
            </select>
            </div>
          ))}
        </div>
      }
      {!variablesNames ? <p>No hay datos exógenos</p> : 
        <div className="w-auto mb-5 mt-5" style={{ overflow: 'auto', maxHeight:'600px', maxWidth: '1200px' }}>
          <MDBTable hover style={{ width: 'max-content', height: 'max-content' }}>
            <MDBTableHead className="bg-primary">
              <tr>
                <th scope='col' className="text-white">Producto</th>
                {variablesNames.map(item=>(<th scope='col' className="text-white" key={item}>{item}</th>))}
              </tr>
            </MDBTableHead>
            {console.log(variablesNames)}
            <MDBTableBody>
              { loader ? <ClipLoader color="#2b9eb3" className='mt-2 ms-2'/> :
                Object.entries(dataAllocationMatrix).map(([product, correlations]) => (
                  <tr key={product}>
                    <td style={{maxWidth: "300px"}}>{product}</td>
                    {variablesNames.map(variable => {
                      const correlationObject = correlations.find(obj => obj[variable]);
                      const correlationValue = correlationObject ? parseFloat(correlationObject[variable]) : '';
                      
                      let cellClass = '';
                      
                      if (parseFloat(correlationValue) < -0.5) {
                        cellClass = 'bg-danger text-white';
                      } else if (parseFloat(correlationValue) > 0.5) {
                        cellClass = 'bg-success text-white';
                      }

                      return <td key={variable} className={cellClass}>{correlationValue}</td>;
                    })}
                  </tr>
                ))                
              }
            </MDBTableBody>
          </MDBTable>
        </div>
      }
    </div>
  );
};

export default GraphAllocationMatrix;

