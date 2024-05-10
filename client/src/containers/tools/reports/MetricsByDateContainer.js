import { MDBBtn, MDBIcon, MDBRow } from "mdb-react-ui-kit"; 
import TableMape from "../../../components/admin/tools/reports/TableMape";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import GraphMape from "./GraphMape";
import { showErrorAlert } from "../../../components/other/Alerts";
import GraphModels from "./GraphModels";

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
  const [dataGraph, setDataGraph] = useState({"x": 0, "y": 0});
  const[dataModelGraph, setDataModelGraph] = useState({"models": 0, "avg": 0});
  const [selectedDate, setSelectedDate] = useState(null);
  const [optionsFilter, setOptionsFilter] = useState([]);
  const [errorType, setErrorType] = useState("");
  const inputRef = useRef(null);

  // Function to get scenarios
  const handleOnChangeScenario = (e) =>{
    let id = e.target.value;
    setScenarioId(id);
    const data = {
      filter_name: 'date',
      scenario_id: id,
      project_id: localStorage.getItem("projectId"),
      filter_value: "x"
    };

    axios.post(`${apiUrl}/forecast/get-filters`, data, {headers})
    .then(res => {
      setDates(res.data);
      axios.get(`${apiUrl}/scenarios/${id}`, {
        headers: headers
      })
      .then(res=> setErrorType(res.data.error_type))
      .catch(err=> showErrorAlert("Ocurrio un error inesperado. Intente mas tarde"));
    })
    .catch((err) => {setDates([])} );

    handleGraphicData(id);
    handleGraphicDataModels(id);

    if (id == "-----" || id == 0) {
      setOptionsFilter([]); 
      setDataGraph({"x": 0, "y": 0}); 
      setDataModelGraph({"models": 0, "avg": 0})
    };
  };

  // Function to get graphic data 
  const handleGraphicData = (scId) => { 
    const data = {
      "filter_name": "date",
      "scenario_id": scId,
      "project_id": localStorage.getItem("projectId"),
      "filter_value": "x"
    }

    axios.post(`${apiUrl}/forecast/graphic-mape`, data, {headers})
    .then(res => setDataGraph(res.data))
    .catch(err => console.log(err)); 
  };

  // Function to get graphic data 
  const handleGraphicDataModels = (scId) => { 
    const data = {
      "scenario_id": scId,
    }

    axios.post(`${apiUrl}/forecast/graphic-model`, data, {headers})
    .then(res => setDataModelGraph(res.data))
    .catch(err => console.log(err)); 
  };

  // Function for get filters from server
  const handleClickFilter = (e) => {
    const data = {
      filter_name: e.target.name,
      scenario_id: scenarioId,
      project_id: localStorage.getItem("projectId"),
      filter_value: "x"
    };

    axios.post(`${apiUrl}/forecast/get-filters`, data, { headers })
    .then(res => setOptionsFilter(res.data))
    .catch(err => console.log(err));
  };

  // Function for Graphic data with filter
  const handleOnChangeFilter = (e) => {
    const data = {
      filter_name: e.target.name,
      scenario_id: scenarioId,
      project_id: localStorage.getItem("projectId"),
      filter_value: e.target.value
    };

    axios.post(`${apiUrl}/forecast/graphic-mape`, data, {headers})
    .then(res => setDataGraph(res.data))
    .catch(err => console.log(err)); 
  }

  // Function to send date to server and get table data
  const handleOnChangeDates = (e) => {
    let date = e.target.value;
    setSelectedDate(date);

    if (date !== null){
      const data = {
        filter_name: 'date',
        scenario_id: scenarioId,
        project_id: localStorage.getItem("projectId"),
        filter_value: date
      };
  
      axios.post(`${apiUrl}/forecast/report-mape-date`, data,{headers})
      .then(res => {setData(res.data)})
      .catch(res => {console.log(res)})
    }

  };

  // Function to get an specific product
  const handleSearch = () => {
    const inputValue = inputRef.current.value;
    if(inputValue === ""){
      showErrorAlert("Debe ingresar un SKU");
    } else {
      if (selectedDate === null || selectedDate === "-----") {
        showErrorAlert("Debe seleccionar una fecha");
      } else {
        const data = {
          filter_name: 'date',
          scenario_id: scenarioId, 
          project_id: localStorage.getItem("projectId"),
          filter_value: selectedDate,
          product: inputValue
        };
    
        axios.post(`${apiUrl}/forecast/report-mape-date`, data, { headers })
        .then(res => {
          setData(res.data);
        })
        .catch(error => {
          console.error(error);
        }); 
      }

    }

    inputRef.current.value = "";
  };

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

  // Function for download excel
  const handleDownload = (urlPath) => {
    const link = document.createElement("a");
    link.href = `${apiUrl}/${urlPath}`;
    link.download = `StockDeSeguridad.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    if(data === null || selectedDate === "-----" || selectedDate === null){
      showErrorAlert("Debe elegirse una fecha");
    }
    else {
      const dataToSend = {
        "columns": ["Producto", "Venta Real", "Venta Predecida", "MAPE"],
        "rows": data,
        "file_name": `ReportePorFecha`,
        "project_pk": parseInt(localStorage.getItem("projectId"))
      }
      
      axios.post(`${apiUrl}/export_excel`, dataToSend, {
        headers: headers,
      })
      .then(res => {
        let file_path = res.data.file_url
        handleDownload(file_path);
      })
      .catch(err => console.log(err)) 
    }
  }

  return (
    <div className="w-100 px-3 gap-5">
      <MDBRow className="d-flex justify-content-start align-items-start gap-2 flex-wrap">
        
        <div className="w-auto d-flex flex-column justify-content-center align-items-start gap-1">
          <p className="text-primary w-auto m-0 p-0">Seleccionar Escenario</p>
          <select className="form-select w-100 mt-2" style={{"maxWidth": "250px", "minWidth":"200px"}} onChange={handleOnChangeScenario}>
            <option value={0}>-----</option>
            {scenarios.map(item => (
              <option key={item.id} value={item.id}>{item.scenario_name}</option>
            ))}
          </select>
        </div>

        <div className="w-auto d-flex flex-column justify-content-center align-items-start gap-1">
          <p className="text-primary w-auto m-0 p-0">Familia</p>
          <select onClick={handleClickFilter} className="form-select w-100 mt-2" style={{"maxWidth": "250px", "minWidth":"200px"}} name="Family" onChange={handleOnChangeFilter}>
            <option value={0}>-----</option>
            {optionsFilter.map(item => (
              <option key={item} value={item} >{item}</option>
            ))}
          </select>
        </div>

        <div className="w-auto d-flex flex-column justify-content-center align-items-start gap-1">
          <p className="text-primary w-auto m-0 p-0">Categoria</p>
          <select onClick={handleClickFilter} className="form-select w-100 mt-2" style={{"maxWidth": "250px", "minWidth":"200px"}} name="Category" onChange={handleOnChangeFilter}>
            <option value={0}>-----</option>
            {optionsFilter.map(item => (
              <option key={item} value={item} >{item}</option>
            ))}
          </select>
        </div>

        <div className="w-auto d-flex flex-column justify-content-center align-items-start gap-1">
          <p className="text-primary w-auto m-0 p-0" onChange={handleOnChangeFilter}>SKU</p>
          <select onClick={handleClickFilter} className="form-select w-100 mt-2" style={{"maxWidth": "250px", "minWidth":"200px"}} name="SKU" onChange={handleOnChangeFilter}>
            <option value={0}>-----</option>
            {optionsFilter.map(item => (
              <option key={item} value={item} >{item}</option>
            ))}
          </select>
        </div>

      </MDBRow>

      <MDBRow className="w-auto d-flex justify-content-between align-items-center" >
        <GraphMape errorName={errorType} scenario={scenarioId} graphicData={dataGraph}/>
        <GraphModels scenario={scenarioId} graphicData={dataModelGraph}/>
      </MDBRow>

      <MDBRow className="mt-5">
        <div className="d-flex w-100 justify-content-between align-items-center mb-5">
          <div className="w-50 d-flex flex-column justify-content-center align-items-start gap-1">
            <p className="text-primary w-auto m-0 p-0">Buscar producto</p>
            <div class="input-group mb-3">
              <input type="text" className="form-control" placeholder="Buscar por SKU" name='product' ref={inputRef}/>
              <MDBBtn style={{ backgroundColor: '#3b5998' }} onClick={handleSearch}>
                <MDBIcon fas icon="search" />
              </MDBBtn>
            </div>
          </div>

          <div className="w-50 d-flex flex-column justify-content-center align-items-end gap-1">
            <p className="text-primary w-auto m-0 ms-1 p-0">Seleccionar Fecha</p>
            <select onChange={handleOnChangeDates} className="form-select w-100 mt-2" style={{"maxWidth": "250px"}}>
              <option value={null}>-----</option>
              {dates.map(date=>(<option value={date}>{date}</option>))}
            </select>
          </div>
        </div>
        
        <MDBBtn onClick={handleExportExcel} className="w-auto mb-4 ms-3" style={{ backgroundColor: '#25d366' }}>
          Exportar como Excel
          <MDBIcon className="ms-2" fas icon="file-export" />
        </MDBBtn>

        <TableMape errortype={errorType} data={data}/>
      </MDBRow>
    </div>
  )
}

export default MetricsByDateContainer