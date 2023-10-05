import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { MDBTable, MDBTableHead, MDBTableBody, MDBIcon, MDBCollapse, MDBContainer, MDBRow, MDBCol } from 'mdb-react-ui-kit';
import axios from 'axios';
import EmptyLineChart from './EmptyChartLine';
import { showErrorAlert } from '../../../other/Alerts';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};


const Graph = () => {
  const token = localStorage.getItem("userToken");
  const headers = {
    'Authorization': `Token ${token}`, 
    'Content-Type': 'application/json', 
  };
  
  const [showShow, setShowShow] = useState(false);

  const toggleShow = () => setShowShow(!showShow);
  
  const [data, setData] = useState(false);

  const [scenarios, setScenarios] = useState([]);
  
  useEffect(() => {
    axios.get("http://localhost:8000/scenarios", { headers })
    .then(res => {
      setScenarios(res.data);
      
    })
    .catch(err => {
      console.log(err);
    })
  }, []);
  
  const handleDownload = (scenarioName, urlPath) => {
    const link = document.createElement("a");
    link.href = `http://localhost:8000/${urlPath}`;
    link.download = `predicciones_${scenarioName}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOnChange = (e) => {

    let scenarioId = e.target.value;
    axios.get(`http://localhost:8000/scenarios/${scenarioId}`, { headers })
    .then(res => {
      let graphicData =  res.data.graphic_data;
      
      const data = {
        labels: graphicData.actual_data.x,
        datasets: [
          {
            label: 'Valor actual',
            data: graphicData.actual_data.y,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'Valor predecido',
            data: graphicData.other_data.y,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          }
        ]
      }; 

      setData(data);
    })
    .catch(err => {
      console.log(err)
      if (err.response.status === 401) { showErrorAlert("Su sesion ha expirado, debe iniciar sesion nuevamente"); }
      if (err.response.status === 404) { setData(false) }
    })
  }

  return(
    <div className='d-flex justify-content-center align-items-center gap-5 flex-column w-100'>
    
      <div className='d-flex justify-content-between align-items-center w-100 px-5'>
        <div>
          <p style={{"cursor": "pointer", "color": "#285192"}} onClick={toggleShow}>
          <MDBIcon fas icon="history" /> Ver historial de escenarios
          </p>
          <MDBCollapse show={showShow}>
            <MDBTable className='caption-top'>
              <MDBTableHead>
                <tr>
                <th scope='col'>ID</th>
                <th scope='col'>Escenario</th>
                <th scope='col'>Excel</th>
                <th scope='col'>Archivo</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody>

              {
                scenarios.length === 0 ? 
                <tr>
                  <th scope='row'></th>
                  <td>No hay escenarios</td>
                  <td></td>
                  <td></td>
                </tr>
                  :
              
                scenarios.map(scenario => (
                  <tr>
                    <th scope='row'>{scenario.id}</th>
                    <td>{scenario.scenario_name}</td>
                    <td style={{ cursor: "pointer" }} onClick={() => handleDownload(scenario.scenario_name, scenario.url_predictions)} >
                      <MDBIcon fas icon='file-excel' /> Excel Predicciones
                    </td>
                    <td>Historical Data</td>
                  </tr>
              ))}
              </MDBTableBody>
            </MDBTable>
          </MDBCollapse> 
        </div>

        <div>
          <select className="form-select" onChange={handleOnChange}>
            <option defaultValue>Mostrar grafico de escenario..</option>
            {scenarios.map((scenario) => (
              <option value={scenario.id}>{scenario.scenario_name}</option>
            ))}
          </select>
        </div>
      </div>
      <MDBContainer>
        <MDBRow>
          <MDBCol size='3' className='border'>
            Filtros
          </MDBCol>
          <MDBCol size='9'>
            { !data ? <EmptyLineChart/> : <Line options={options}  data={data}/> }
          </MDBCol>
        </MDBRow>
      </MDBContainer>
      {console.log(data)}
    </div>
    /*   */
  )
}

export default Graph;



