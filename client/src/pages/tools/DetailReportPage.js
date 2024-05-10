import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../../components/navs/Navbar';
import ToolsNav from '../../components/navs/ToolsNav';
import axios from 'axios';
import TableReport from '../../components/admin/tools/kpis/Table';
import { showErrorAlert } from '../../components/other/Alerts';
import { useNavigate } from 'react-router-dom';
import TableInfoKpi from '../../components/admin/tools/kpis/TableInfoKpi';
import { MDBBtn, MDBIcon } from 'mdb-react-ui-kit';

const apiUrl = process.env.REACT_APP_API_URL;

const DetailReportPage = () => {
    // AUTHORIZATION HEADERS //
    const token = localStorage.getItem("userToken");
    const headers = {
        'Authorization': `Token ${token}`, 
        'Content-Type': 'application/json', 
    };

    const navigate = useNavigate();

    const [scenarios, setScenarios] = useState([]);
    const [scenarioId, setScenarioId] = useState(0);
    const [dateFilter, setDateFilter] = useState(0);
    const [group, setGroup] = useState(0);
    const [tableData, setTableData] = useState([]);
    const [reportTableData, setReportTableData] = useState([]);
    const inputRef = useRef(null);

    const handleOnChangeScenario = (e) => {
        let id = e.target.value;
        setScenarioId(id);
    }

    const handleOnChangeGroup = (e) => {
        let value = e.target.value;
        if (dateFilter === 0) {
            setGroup(value); 
        } else {
            let value = e.target.value;
            setGroup(value); 
            
            const data = {
                filter_name: value,
                scenario_id: scenarioId,
                project_id: localStorage.getItem("projectId"),
                filter_value: dateFilter
            };

            axios.post(`${apiUrl}/forecast/get-report`, data, {headers})
            .then(res => {
                setTableData(res.data.data_per_month);
                setReportTableData(res.data.reports);
            })
            .catch(err => {showErrorAlert(`Ocurrio un error: ${err.response.data}`); console.log(err)})
        }
    };

    const handleSearch = () => {
        const inputValue = inputRef.current.value;
        if(inputValue === ""){
          showErrorAlert("Debe ingresar un SKU");
        } else {
            if (group !== 'SKU'){
                showErrorAlert("Debe agrupar por SKU");
            } else {
                if(dateFilter === 0) {showErrorAlert("Debe seleccionar mes")}
                else{
                    const data = {
                        filter_name: group,
                        scenario_id: scenarioId,
                        project_id: localStorage.getItem("projectId"),
                        filter_value: dateFilter,
                        product: inputValue
                    };
            
                    axios.post(`${apiUrl}/forecast/get-report`, data, {headers})
                    .then(res => {
                        setTableData(res.data.data_per_month);
                        setReportTableData(res.data.reports);
                        console.log(res.data.reports)
                    })
                    .catch(err => {
                        if (err.response.status === 400) showErrorAlert("Debe seleccionar una agrupación");
                        if (err.response.status === 401) {showErrorAlert("Su sesion expiró"); navigate("'/login");}
                        if (err.response.status === 500) showErrorAlert("Error en el servidor");
                    });
                }
            }
        }
    
        inputRef.current.value = "";
    };

    const handleOnChangeDates = (e) => {
        setDateFilter(e.target.value);

        const data = {
            filter_name: group,
            scenario_id: scenarioId,
            project_id: localStorage.getItem("projectId"),
            filter_value: e.target.value
        };

        axios.post(`${apiUrl}/forecast/get-report`, data, {headers})
        .then(res => {
            setTableData(res.data.data_per_month);
            setReportTableData(res.data.reports);
        })
        .catch(err => {
            if (err.response.status === 400) showErrorAlert("Debe seleccionar una agrupación");
            if (err.response.status === 401) {showErrorAlert("Su sesion expiró"); navigate("'/login");}
            if (err.response.status === 500) showErrorAlert("Error en el servidor");
        });
    };

    // Function for download excel
    const handleDownload = (urlPath) => {
        const link = document.createElement("a");
        link.href = `${apiUrl}/${urlPath}`;
        link.download = `StockDeSeguridad.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExport = () => {
        const dataToSend = {
            "columns": [group, "YTD", "MTD", "QTD","YTG", "MTG", "QTG"],
            "rows": reportTableData,
            "file_name": `ReportForecast`,
            "project_pk": parseInt(localStorage.getItem("projectId"))
        };
          
        axios.post(`${apiUrl}/export_excel`, dataToSend, {
            headers: {
                'Authorization': `Token ${localStorage.getItem("userToken")}`, 
                'Content-Type': 'application/json'
            },
        })
        .then(res => {
            let file_path = res.data.file_url
            handleDownload(file_path);
        })
        .catch(err => {showErrorAlert(err.response.data); console.log(err)});  
    }
    
    useEffect(() => {
        axios.get(`${apiUrl}/scenarios/`, {
        headers: headers
        })
        .then(res => {
            let projectId = parseInt(localStorage.getItem("projectId"))
            let scenarios = res.data.filter(item => item.project === projectId);
            setScenarios(scenarios);
            setScenarioId(res.data[0].id);
        })
        .catch(err => {
            console.log(err);
        })

    }, []);
    
        
    return (
        <div>
            <Navbar/>
            <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-start gap-3 align-items-start p-3 pt-5 bg-white">
                <ToolsNav/>
                <div className='d-flex justify-content-between align-items-center w-100'>
                    <div className='d-flex justify-content-start align-items-center ms-5 gap-2 w-auto'>

                        <div className='d-flex flex-column justify-content-start align-items-center gap-2 w-auto'>
                            <div className='py-1 px-2 bg-primary text-white w-100'>
                                Escenario
                            </div>
                            <select className="form-select w-100" style={{"minWidth": "190px"}} onChange={handleOnChangeScenario}>
                                <option value={0} >-----</option>
                                {scenarios.map((scenario) => (
                                <option value={scenario.id}>{scenario.scenario_name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className='d-flex flex-column justify-content-start align-items-center gap-2 w-auto' style={{"minWidth": "100px"}}>
                            <div className='py-1 px-2 bg-primary text-white w-100'>
                                Agrupar por
                            </div>
                            <select onChange={handleOnChangeGroup} className="form-select w-100" >
                                {group === 0 && <option defaultChecked value={0}>-----</option>}
                                <option name="Familia" value='Family'>Familia</option>
                                <option name="Region" value='Region'>Region</option>
                                <option name='Categoria' value='Category'>Categoria</option>
                                <option name="Subcategoria" value='Subcategory'>Subcategoria</option>
                                <option name="SKU" value='SKU'>SKU</option>
                                <option name="Vendedor" value='Salesman'>Vendedor</option>
                                <option name="Cliente" value='client'>Cliente</option>
                            </select>
                        </div>
                        
                        <div className='d-flex flex-column justify-content-start align-items-center gap-2' style={{"minWidth": "190px"}}>
                            <div className='py-1 px-2 bg-primary text-white w-100'>
                                Elegir Mes
                            </div>
                            <select onChange={handleOnChangeDates} className="form-select w-100">
                                <option value={1}>Enero</option>
                                <option value={2}>Febrero</option>
                                <option value={3}>Marzo</option>
                                <option value={4}>Abril</option>
                                <option value={5}>Mayo</option>
                                <option value={6}>Junio</option>
                                <option value={7}>Julio</option>
                                <option value={8}>Agosto</option>
                                <option value={9}>Septiembre</option>
                                <option value={10}>Octubre</option>
                                <option value={11}>Noviembre</option>
                                <option value={12}>Diciembre</option>
                            </select>
                        </div>
                    </div>

                    <div className="d-flex flex-column justify-content-center align-items-start gap-1 mt-4">
                        <p className="text-primary w-auto m-0 p-0">Buscar producto</p>
                        <div class="input-group mb-3">
                            <input type="text" className="form-control" placeholder="Buscar por SKU" name='product' ref={inputRef}/>
                            <MDBBtn style={{ backgroundColor: '#3b5998' }} onClick={handleSearch}>
                                <MDBIcon fas icon="search" />
                            </MDBBtn>
                        </div>
                    </div>
                </div>
                
                <div className='px-5 w-100 mt-5'>
                    <h5 className='mb-3'>Reporte por año</h5>
                    <TableReport props={group} data={tableData} />
                </div>
                
                    <div className='px-5 w-100 mt-5 mb-5'>
                        <h5 className='mb-3'>Reporte desde ultimo mes con datos</h5>
                        <MDBBtn onClick={handleExport} className="w-auto mb-4" style={{ backgroundColor: '#25d366' }}>
                            Exportar como Excel
                            <MDBIcon className="ms-2" fas icon="file-export" />
                        </MDBBtn> 
                        {
                            reportTableData.length > 0 &&
                            <TableInfoKpi props={group} data={reportTableData} />
                        }
                    </div>
                 
        </main>
        </div>
    )
}

export default DetailReportPage