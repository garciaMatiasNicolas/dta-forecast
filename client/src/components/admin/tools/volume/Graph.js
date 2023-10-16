import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { MDBTable, MDBTableHead, MDBTableBody, MDBIcon, MDBCollapse, MDBContainer, MDBRow, MDBCol } from 'mdb-react-ui-kit';
import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { showErrorAlert } from '../../../other/Alerts';
import axios from 'axios';
import EmptyLineChart from './EmptyChartLine';
import { filters } from '../../../../data/filters';
import Mape from './Mape';

const apiUrl = process.env.API_URL;
console.log(apiUrl)

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement, 
);

const Graph = () => {

  // AUTHORIZATION HEADERS //
  const token = localStorage.getItem("userToken");
  const headers = {
    'Authorization': `Token ${token}`, 
    'Content-Type': 'application/json', 
  };
  
  // STATES //
  const [showShow, setShowShow] = useState(false);

  // State for show scenarios history
  const toggleShow = () => setShowShow(!showShow);
  
  // State for data graph all
  const [data, setData] = useState(false);

  // State for data graph yearly
  const [dataYear, setDataYear] = useState(false);

  // State for set scenarios
  const [scenarios, setScenarios] = useState([]);

  // State for set id scenario
  const [scenarioId, setScenarioId] = useState(0);

  // State for get filters from server
  const [optionsFilter, setOptionsFilter] = useState([]);

  // State for MAPE
  const [mape, setMape] = useState(0);

  // Graph options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };
  
  // USE EFFECT //
  useEffect(() => {
    // Get all scenarios and set state on first render
    axios.get(`http://localhost:8000/scenarios/`, {
      headers: headers
    })
    .then(res => {
      setScenarios(res.data);
      console.log(res)
    })
    .catch(err => {
      console.log(err);
    })
  }, []);
  
  // Function for download excel
  const handleDownload = (scenarioName, urlPath) => {
    const link = document.createElement("a");
    link.href = `http://localhost:8000/${urlPath}`;
    link.download = `predicciones_${scenarioName}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Function for get filters from server
  const handleClickFilter = (e) => {
    const data = {
      filter_name: e.target.name,
      scenario_id: scenarioId,
      project_id: localStorage.getItem("projectId"),
      filter_value: "x"
    };

    axios.post(`http://localhost:8000/get-filters`, data, { headers })
    .then(res => setOptionsFilter(res.data))
    .catch(err => console.log(err));
  };

  // Function for graphic data using filters
  const handleOnChangeFilter = (e) => {
    const dataFilter = {
      filter_name: e.target.name,
      scenario_id: scenarioId,
      project_id: localStorage.getItem("projectId"),
      filter_value: e.target.value
    };
    console.log(dataFilter)

    axios.post(`http://localhost:8000/filter-data`, dataFilter,{ headers })
    .then(res => {
      let graphicLineData =  res.data.full_data;
      let graphicBarData = res.data.year_data;

      const dataLine = {
        labels: graphicLineData.actual_data.x,
        datasets: [
          {
            label: 'Valor actual',
            data: graphicLineData.actual_data.y,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'Valor predecido',
            data: graphicLineData.other_data.y,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          }
        ]
      }; 

      const dataBar = {
        labels: graphicBarData.actual_data.x,
        datasets: [
        {
          label: 'Valor actual',
          data: graphicBarData.actual_data.y,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: 'Valor predecidos',
          data: graphicBarData.other_data.y,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        ],
      };
        
      setData(dataLine);
      setDataYear(dataBar);
    })
    .catch(err => console.log(err.response));
  };

  // Function for set graphic data by scenario on select 
  const handleOnChange = (e) => {
    let scenarioId = e.target.value;
    setScenarioId(scenarioId);
    axios.get(`http://localhost:8000/scenarios/${scenarioId}`, { headers })
    .then(res => {
      let graphicLineData =  res.data.final_data_pred;
      let graphicBarData = res.data.data_year_pred;
      
      const dataLine = {
        labels: graphicLineData.actual_data.x,
        datasets: [
          {
            label: 'Valor actual',
            data: graphicLineData.actual_data.y,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'Valor predecido',
            data: graphicLineData.other_data.y,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          }
        ]
      }; 

      const dataBar = {
        labels: graphicBarData.actual_data.x,
        datasets: [
        {
          label: 'Valor actual',
          data: graphicBarData.actual_data.y,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: 'Valor predecidos',
          data: graphicBarData.other_data.y,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        ],
      };
        
      setData(dataLine);
      setDataYear(dataBar);
      setMape(res.data.mape_scenario);
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
          <MDBCol size='3' className="d-flex justify-content-start align-items-start gap-3 flex-column">
            <Mape mape={mape}/>
            {filters.map(item => (
              <div className='w-100'>
                <div className="d-flex justify-content-start align-items-center gap-3">
                    <MDBIcon icon={item.icon}/>
                    <p className="mt-3">{item.label}</p>
                </div>
                <select onClick={handleClickFilter} onChange={handleOnChangeFilter} style={{"minWidth": "200px"}} className="form-select w-100" name={item.name}>
                    <option defaultValue>-----</option>
                    {optionsFilter.map(item => (
                      <option key={item} value={item} >{item}</option>
                    ))}
                </select>
              </div>
            ))}
          </MDBCol>
          <MDBCol size='9' className='d-flex justify-content-center align-items-center gap-5 flex-column'>
            { !data ? <EmptyLineChart/> : <Bar options={options} data={dataYear} />}
            { !data ? <EmptyLineChart/> : <Line options={options} data={data}/> }
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  )
}

export default Graph;