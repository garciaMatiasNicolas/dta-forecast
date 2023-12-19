import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { MDBIcon, MDBContainer, MDBRow, MDBCol } from 'mdb-react-ui-kit';
import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { showErrorAlert } from '../../../other/Alerts';
import axios from 'axios';
import EmptyLineChart from './EmptyChartLine';
import { filters } from '../../../../data/filters';
import Mape from './Mape';

const apiUrl = process.env.REACT_APP_API_URL;


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

  // State for MAPES
  const [error, setError] = useState(0);
  const [errorLastPeriod, setErrorLastPeriod] = useState(0);
  const [errorAbs, setErrorAbs] = useState(0);
  const [errorType, setErrorType] = useState('');

  // Graph Line options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  // Graph Bar options
  const optionsBar = {
    scales: {
      x: { stacked: true },
      y: { stacked: true },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const data = context.dataset.data[context.dataIndex];
            return `Valor: ${data}`;
          },
        },
      },
    },
  }
  
  // USE EFFECT //
  useEffect(() => {
    // Get all scenarios and set state on first render
    axios.get(`${apiUrl}/scenarios/`, {
      headers: headers
    })
    .then(res => {
      let projectId = parseInt(localStorage.getItem("projectId"))
      let scenarios = res.data.filter(item => item.project === projectId);
      setScenarios(scenarios);
    })
    .catch(err => {
      console.log(err);
    })
  }, []);
  
  // Function for get filters from server
  const handleClickFilter = (e) => {
    const data = {
      filter_name: e.target.name,
      scenario_id: scenarioId,
      project_id: localStorage.getItem("projectId"),
      filter_value: "x"
    };

    axios.post(`${apiUrl}/get-filters`, data, { headers })
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

    axios.post(`${apiUrl}/filter-data`, dataFilter,{ headers })
    .then(res => {
      let graphicLineData =  res.data.full_data;
      let graphicBarData = res.data.year_data;

      const dataLine = {
        labels: graphicLineData.other_data.x,
        datasets: [
          {
            label: 'Actual',
            data: graphicLineData.actual_data.y,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'Predecido',
            data: graphicLineData.other_data.y,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          }
        ]
      }; 

      const dataBar = {
        labels: graphicBarData.other_data.x,
        datasets: [
        {
          label: 'Actual',
          data: graphicBarData.actual_data.y,
          backgroundColor: 'rgba(255, 99, 132, 0.5)'
        },
        {
          label: 'Predecido',
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
    axios.get(`${apiUrl}/scenarios/${scenarioId}`, { headers })
    .then(res => {
      let graphicLineData =  res.data.final_data_pred;
      let graphicBarData = res.data.data_year_pred;
      
      const dataLine = {
        labels: graphicLineData.other_data.x,
        datasets: [
          {
            label: 'Actual',
            data: graphicLineData.actual_data.y,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'Predecido',
            data: graphicLineData.other_data.y,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          }
        ]
      }; 

      const dataBar = {
        labels: graphicBarData.other_data.x,
        datasets: [
        {
          label: 'Actual',
          data: graphicBarData.actual_data.y,
          backgroundColor: 'rgba(255, 99, 132, 0.5)'
        },
        {
          label: 'Predecido',
          data: graphicBarData.other_data.y,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        ],
      };

      setData(dataLine);
      setDataYear(dataBar);
      setError(res.data.error_last_twelve_periods);
      setErrorLastPeriod(res.data.error_last_period);
      setErrorAbs(res.data.error_abs);
      setErrorType(res.data.error_type)
      console.log(res);
    })
    .catch(err => {
      if (err.response.status === 401) { showErrorAlert("Su sesion ha expirado, debe iniciar sesion nuevamente"); }
      if (err.response.status === 404) { setData(false) }
    })
  }

  return(
    <div className='d-flex justify-content-center align-items-center gap-5 mb-5 flex-column w-100'>
    
      <div className='d-flex justify-content-between align-items-center w-100 px-5'>
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
            <Mape errorType={errorType} mainError={error} errorLastPeriod={errorLastPeriod} errorAbs={errorAbs}/>
            {filters.map(item => (
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
                      <option key={item} value={item} >{item}</option>
                    ))}
                </select>
              </div>
            ))}
          </MDBCol>
          <MDBCol size='9' className='d-flex justify-content-center align-items-center gap-5 flex-column'>
            <div className='w-75 '>
              { !data ? <EmptyLineChart/> : <Bar options={optionsBar} data={dataYear} />}
            </div>
            { !data ? <EmptyLineChart/> : <Line options={options} data={data}/> }
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  )
}

export default Graph;