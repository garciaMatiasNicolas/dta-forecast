import { MDBContainer, MDBRow, MDBCol, MDBIcon, MDBInput, MDBBtn } from 'mdb-react-ui-kit';
import { useEffect, useRef, useState } from 'react';
import { showErrorAlert } from '../../../other/Alerts';
import axios from 'axios';
import EmptyLineChart from './EmptyChartLine';
import Mape from './Mape';
import Filters from '../Filters';
import { filters } from '../../../../data/filters';
import SkuSearch from './SkuSearch';
import ForecastValuedTable from './ForecastValuedTable';
import Highcharts from "highcharts"
import HighchartsReact from 'highcharts-react-official';

const apiUrl = process.env.REACT_APP_API_URL;

const Graph = () => {

  // AUTHORIZATION HEADERS //
  const token = localStorage.getItem("userToken");
  const headers = {
    'Authorization': `Token ${token}`, 
    'Content-Type': 'application/json', 
  };
  
  // STATES //
  const [allSeriesVisible, setAllSeriesVisible] = useState(true); // Estado para la visibilidad de las series
  const chartRef = useRef(null); // Referencia para el gráfico
  const [loading, setLoading] = useState(false);

  // State for data graph all
  const [data, setData] = useState(false);

  // State for data conversion 
  const [dataConversion, setDataConversion] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  // State for data graph yearly
  const [dataYear, setDataYear] = useState(false);

  // State for set scenarios
  const [scenarios, setScenarios] = useState([]);
  
  // State for set id scenario
  const [scenarioId, setScenarioId] = useState(0);

  // State for SKU
  const skuInputRef = useRef(null);
  
  // State for filters nested
  const [conditions, setConditions] = useState([]);
  
  // State for MAPES
  const [error, setError] = useState(0);
  const [errorLastPeriod, setErrorLastPeriod] = useState(0);
  const [errorAbs, setErrorAbs] = useState(0);
  const [errorType, setErrorType] = useState('');
  
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

  // Función para alternar la visibilidad de todas las series
  const toggleAllSeries = () => {
    const chart = chartRef.current.chart;
    chart.series.forEach((series) => {
        series.setVisible(!allSeriesVisible, false); // Cambia la visibilidad sin redibujar
    });
    chart.redraw(); // Redibuja el gráfico
    setAllSeriesVisible(!allSeriesVisible); // Actualiza el estado
  };
  
  const setDataInGraphs = (labelsYear, labelsAll, dataYearPred, dataAllPred, dataYearActual, dataAllActual) => {
    
    // Para el gráfico de líneas (series de 'Actual' y 'Predecido')
    const lineOptions = {
      legend: {
        enabled: true,
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom',
      },
      chart: {
        type: 'line',
        height: 600
      },
      title: {
        text: 'Actual vs Predecido - Todo el año',
      },
      xAxis: {
        categories: labelsAll, // Etiquetas en el eje X
      },
      yAxis: {
        title: {
          text: 'Valores',
        },
      },
      series: [
        {
          name: 'Actual',
          data: dataAllActual, // Valores de 'Actual'
          color: 'rgb(255, 99, 132)',
          lineWidth: 3
        },
        {
          name: 'Predecido',
          data: dataAllPred, // Valores de 'Predecido'
          color: 'rgb(53, 162, 235)',
          lineWidth: 3
        }
      ],
      plotOptions: {
        line: {
          marker: {
            radius: 1.5 // Tamaño de los puntos en las líneas
          }
        }
      }
    };

    // Para el gráfico de barras (series de 'Actual' y 'Predecido')
    const barOptions = {
      chart: {
        type: 'column',
      },
      title: {
        text: 'Actual vs Predecido - Año',
      },
      xAxis: {
        categories: labelsYear, // Etiquetas en el eje X
      },
      yAxis: {
        title: {
          text: 'Valores',
        },
      },
      series: [
        {
          name: 'Predecido',
          data: dataYearPred, // Datos de 'Predecido'
          color: 'rgba(53, 162, 235, 0.5)', // Color para la serie 'Predecido'
        },
        {
          name: 'Actual',
          data: dataYearActual, // Datos de 'Actual'
          color: 'rgba(255, 99, 132, 0.5)', // Color para la serie 'Actual'
        },
      ],
      plotOptions: {
        column: {
          stacking: 'normal', // Estilo de apilamiento (opcional)
        },
      },
    };

    // Setear los datos usando los hooks correspondientes (o método de actualización)
    setData(lineOptions);  // Para el gráfico de líneas
    setDataYear(barOptions);  // Para el gráfico de barras
  };


  const resetFilters = () => {
    getFirstGraphs(scenarioId);
    setConditions([]);
  }

  // Function for graphic data using filters
  const handleOnChangeFilter = (e) => {

    setLoading(true);

    setConditions((prevConditions) => {
      const updatedConditions = prevConditions.filter(
        (condition) => !condition.hasOwnProperty(e.target.name)
      );
      updatedConditions.push({ [e.target.name]: e.target.value });
      return updatedConditions;
    });

    const dataFilter = {
      filter_name: e.target.name,
      scenario_id: scenarioId,
      project_id: localStorage.getItem("projectId"),
      filter_value: e.target.value,
      conditions: [...conditions, { [e.target.name]: e.target.value }]
    };

    axios.post(`${apiUrl}/forecast/filter-data`, dataFilter,{ headers })
    .then(res => {
      let graphicLineData =  res.data.full_data;
      let graphicBarData = res.data.year_data;
      
      setDataInGraphs(graphicBarData.other_data.x, graphicLineData.other_data.x, graphicBarData.other_data.y, graphicLineData.other_data.y, graphicBarData.actual_data.y, graphicLineData.actual_data.y);
      
    })
    .catch(err => {showErrorAlert(`Ocurrio un error inesperado: ${err.response.error}`); console.log(err)})
    .finally(()=>{setLoading(false)});
    
  };

  // Function to get graph by SKU
  const handleSearchSKU = (e) => {
    e.preventDefault();

    if (scenarioId === 0) {
      showErrorAlert("Debe seleccionar un escenario")
    } else {
      const skuValue = skuInputRef.current.value;

      const dataFilter = {
        filter_name: "SKU",
        scenario_id: scenarioId,
        project_id: localStorage.getItem("projectId"),
        filter_value: skuValue
      };
  
      axios.post(`${apiUrl}/forecast/filter-data`, dataFilter,{ headers })
      .then(res => {
        let graphicLineData =  res.data.full_data;
        let graphicBarData = res.data.year_data;
        console.log(graphicLineData.actual_data.y)

        if (graphicLineData.actual_data.y.every(elemento => elemento === 0)){
          showErrorAlert(`SKU no encontrado`);
        } else {
          setDataInGraphs(graphicBarData.other_data.x, graphicLineData.other_data.x, graphicBarData.other_data.y, graphicLineData.other_data.y, graphicBarData.actual_data.y, graphicLineData.actual_data.y);
        };
        
      })
      .catch(err => showErrorAlert(`SKU no encontrado`))
      .finally(()=>{setLoading(false)})
    };
  }

  const getFirstGraphs = (scenarioId) => {
    setLoading(true);
    if (scenarioId == "Mostrar grafico de escenario..."){
      setData(false)
      setDataInGraphs(false)
    } 
    else {
      axios.get(`${apiUrl}/forecast/graphic-forecast?scenario=${scenarioId}`, { headers })
      .then(res => {
        let graphicLineData =  res.data.final_data_pred;
        let graphicBarData = res.data.data_year_pred;
        
        setDataInGraphs(graphicBarData.other_data.x, graphicLineData.other_data.x, graphicBarData.other_data.y, graphicLineData.other_data.y, graphicBarData.actual_data.y, graphicLineData.actual_data.y);
      })
      .catch(err => {
        if (err.response.status === 401) { showErrorAlert("Su sesion ha expirado, debe iniciar sesion nuevamente"); }
        if (err.response.status === 400) { setData(false) }
      })
      .finally(()=>{setLoading(false)})
    }
  }

  const fetchConversionData = async (id, category) => {
    try {
      const res = await axios.get(`${apiUrl}/forecast/conversion-forecast/?scid=${id}&type_of_conversion=money${category !== "SKU" && `&group_by=${category}`}`);
      setDataConversion(res.data);
      setCurrentPage(0); // Restablece la página actual a 0 cuando se cambia la categoría
    } catch (err) {
      console.log(err);
      setDataConversion([]);
    }
  };

  const handleGroupByForecastValued = (e) => {
    let category = e.target.value;
    fetchConversionData(scenarioId, category);
    setCurrentPage(0); // Restablece la página actual a 0 cuando se cambia la categoría
  }

  const getErrors = (id) => {
    axios.get(`${apiUrl}/scenarios/${id}/`, {
      headers: headers
    })
    .then(res => {
      setErrorType(res.data.error_type);
      setError(res.data.error_last_twelve_periods);
      setErrorAbs(res.data.error_abs);
      setErrorLastPeriod(res.data.error_last_period);
    })
    .catch(res => {
      res.response.status === 404 && showErrorAlert("Escenario no encontrado");
      setError("");
      setErrorType("");
      setErrorAbs("");
      setErrorLastPeriod("");
    })
  };

  // Function for set graphic data by scenario on select 
  const handleOnChangeScenario = (e) => {
    let scenarioId = e.target.value;
    setScenarioId(scenarioId);
    getFirstGraphs(scenarioId);
    getErrors(scenarioId);
    setConditions([]);
    fetchConversionData(scenarioId, "SKU");
    setCurrentPage(0); // Restablece la página actual a 0 cuando se cambia el escenario
  }


  // DRAG GRAPH BY GROUPS //
  const [draggedFilter, setDraggedFilter] = useState(null);
  const [actualOrPredicted, setActualOrPredicted] = useState('actual');
  const [graphGroupBy, setGraphGroupBy] = useState(false);

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Manejar el evento de inicio de arrastre
  const handleDragStart = (event, filterName) => {
    event.dataTransfer.setData('text/plain', filterName);
    setDraggedFilter(filterName);
  };

  // Manejar el evento de soltar en el gráfico
  const handleDrop = (event) => {
    event.preventDefault();
    const filterName = event.dataTransfer.getData('text/plain');
  
    // Verificar si el elemento soltado coincide con los filtros disponibles
    if (draggedFilter === filterName) {
      // Realizar la lógica de filtrado basada en el elemento soltado
      const data = {
        scenario_id: scenarioId,
        group: filterName,
        actual_or_predicted: actualOrPredicted
      };
  
      axios.post(`${apiUrl}/forecast/filter-group`, data, { headers: headers })
      .then(res => {
        const getRandomColor = () => {
          return '#' + Math.floor(Math.random() * 16777215).toString(16);
        };
        
        let highchartsOptions = {};
        
        if (res.data.y && typeof res.data.y === 'object') {
          highchartsOptions = {
            chart: {
              type: 'line',  // Tipo de gráfico
              height: 650,  // Altura del gráfico
            },
            title: {
              text: `Gráfico Filtrado: ${filterName}`,
            },
            xAxis: {
              categories: res.data.x,  // Los valores de X se colocan en las categorías
            },
            yAxis: {
              title: {
                text: 'Valores',  // Cambia esto si necesitas un título diferente
              },
            },
            legend: {
              layout: 'vertical',
              align: 'right',
              verticalAlign: 'top',
              x: 0,
              y: 0
            },
            series: Object.keys(res.data.y).map((category) => ({
              name: category,  // Cada categoría es una serie diferente
              data: res.data.y[category],  // Los datos correspondientes a esa categoría
              color: getRandomColor(),  // Asignar color aleatorio
            })),
            plotOptions: {
              series: {
                lineWidth: 3,  // Grosor de la línea
                marker: {
                  enabled: false  // Desactivar marcadores (puntos) en la línea
                },
                dataLabels: {
                  enabled: false,  // No mostrar etiquetas en los puntos
                },
                enableMouseTracking: true,  // Mantener el rastreo del mouse
              },
            },
          };
        }
  
        setGraphGroupBy(highchartsOptions);
      })
      .catch(err => showErrorAlert(err.response.data.error));
    }
  
    setDraggedFilter(null);
  };
  

  return(
    <div className='d-flex justify-content-center align-items-center gap-5 mb-5 flex-column w-100'>
    
      <div className='d-flex justify-content-between align-items-center w-100 px-5'>
        <div>
          <select className="form-select" onChange={handleOnChangeScenario}>
            <option defaultValue>Mostrar grafico de escenario..</option>
            {scenarios.map((scenario) => (
              <option value={scenario.id}>{scenario.scenario_name}</option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSearchSKU} className="w-auto d-flex justify-content-center align-items-center gap-2">
          <MDBInput
            type="text"
            label="SKU"
            className="w-auto"
            ref={skuInputRef}
          />

          <MDBBtn 
            className="bg-primary w-auto"
            type="submit"
          > <MDBIcon fas icon="search" color="white"/>
          </MDBBtn>
        </form>
      </div>
              
      <MDBContainer className='mb-5'>
        <MDBRow>
          <MDBCol size='3' className="d-flex justify-content-start align-items-start gap-3 flex-column">
            <Mape errorType={errorType} mainError={error} errorLastPeriod={errorLastPeriod} errorAbs={errorAbs}/>
            <Filters handleOnChangeFilter={handleOnChangeFilter} scenario={scenarioId} conditions={conditions}/> 
            <SkuSearch setSku={setDataInGraphs} scenarioId={scenarioId}/>
          </MDBCol>
          <MDBCol size='9' className='d-flex justify-content-center align-items-center gap-5 flex-column'>
          
            <div className='w-100 h-100'>
              { !data ? <EmptyLineChart loading={loading}/> : <HighchartsReact options={dataYear} highcharts={Highcharts}/>}
            </div>

            <div className='w-100'>
              { !data ? <EmptyLineChart loading={loading}/> : <HighchartsReact highcharts={Highcharts} options={data} /> }
            </div>

            <div className='d-flex justify-content-start align-items-center w-auto gap-3 mt-5'>
              <p className="text-primary">Filtros anidados:</p>
              {conditions.map((item, index) => (
                <p key={index} className="text-primary">{Object.keys(item)[0]}: {Object.values(item)[0]}</p>
              ))}
              <p style={{cursor: "pointer"}} onClick={resetFilters}>Reestablecer</p>
            </div>
          </MDBCol>
        </MDBRow>
      </MDBContainer>


      <MDBContainer className='mb-5 w-100 d-flex justify-content-start align-items-start flex-column'>
        <h5 className='text-primary'>Grafico agrupado</h5>      
        <div className='w-auto d-flex justify-content-start alignt-items-center gap-4 flex-wrap'>
          {filters.map((item) => (
            item.name !== 'SKU' &&
            <div
              key={item.name}
              className='w-auto'
              draggable='true'
              onDragStart={(e) => handleDragStart(e, item.name)} 
              style={{ cursor: 'pointer' }}
            >
              <div className='d-flex justify-content-start align-items-center gap-1 w-auto'>
                <MDBIcon icon={item.icon} color='primary' />
                <p className='mt-3 text-primary'>{item.label}</p>
              </div>
            </div>))
          }
          <select onChange={(e)=>{setActualOrPredicted(e.target.value)}} className="form-select w-auto border border-0">
            <option defaultValue className='text-primary' value='actual'>Actual</option>
            <option className='text-primary' value='predicted'>Predecido</option>
          </select>
        </div>
        
        <div className="w-100 mt-5" onDrop={handleDrop} onDragOver={handleDragOver} style={{ cursor: 'pointer' }}>
          <button onClick={toggleAllSeries} className='btn btn-light'>
            <MDBIcon icon={allSeriesVisible ? 'eye-slash' : 'eye'} />
            {allSeriesVisible ? ' Ocultar todo' : ' Mostrar todo'}
          </button>
          {!graphGroupBy ? <EmptyLineChart loading={loading} /> : <HighchartsReact ref={chartRef} highcharts={Highcharts} options={graphGroupBy}/>}
        </div>

      </MDBContainer>
      <MDBContainer className='mt-5 mb-5 w-100 d-flex justify-content-start align-items-start flex-column'>
        <h5 className='text-primary mb-5'>Forecast Valorizado</h5>
        <div className='d-flex justify-content-center align-items-center gap-3 w-auto mb-3'>
          <p className='text-primary w-100 mt-2'>Agrupar por</p>
          <select className="form-select" style={{"maxWidth": "250px", "minWidth":"200px"}} onChange={handleGroupByForecastValued}>
            <option value="SKU">SKU</option>
            <option value="Family">Familia</option>
            <option value="Region">Región</option>
            <option value="Category">Categoria</option>
            <option value="Subcategory">Subcategoria</option>
            <option value="Client">Cliente</option>
            <option value="Salesman">Vendedor</option>
          </select>
        </div>
        <ForecastValuedTable 
          data={dataConversion}
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
        />
      </MDBContainer>
    </div>
  )
}

export default Graph;