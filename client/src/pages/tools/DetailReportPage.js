import React, { useEffect, useState } from 'react'
import Navbar from '../../components/navs/Navbar'
import ToolsNav from '../../components/navs/ToolsNav'
import axios from 'axios';
import TableReport from '../../components/admin/tools/kpis/Table';
import { showErrorAlert } from '../../components/other/Alerts';
import { useNavigate } from 'react-router-dom';
import convertData from '../../functions/stringFormat';

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

    const [dates, setDates] = useState([]);

    const [dateFilter, setDateFilter] = useState(0);

    const [group, setGroup] = useState(0);

    const [tableData, setTableData] = useState([]);

    const handleOnChangeScenario = (e) => {
        let id = e.target.value;
        setScenarioId(id);
        
        const data = {
            filter_name: 'date',
            scenario_id: id,
            project_id: localStorage.getItem("projectId"),
            filter_value: "x"
        };
        
        axios.post(`${apiUrl}/get-filters`, data, {headers})
        .then(res => {setDates(res.data); console.log(res)})
        .catch(() => {setDates([])});
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
            
            axios.post(`${apiUrl}/get-report`, data, {headers})
            .then(res => setTableData(res.data))
            .catch(err => showErrorAlert(`Ocurrio un error: ${err.response.data}`))
        }
    }

    const handleOnChangeDates = (e) => {
        setDateFilter(e.target.value);

        const data = {
            filter_name: group,
            scenario_id: scenarioId,
            project_id: localStorage.getItem("projectId"),
            filter_value: e.target.value
        };

        axios.post(`${apiUrl}/get-report`, data, {headers})
        .then(res => {setTableData(res.data); console.log(res.data)})
        .catch(err => {
            if (err.response.status === 400) showErrorAlert("Debe seleccionar una agrupación");
            if (err.response.status === 401) {showErrorAlert("Su sesion expiró"); navigate("'/login");}
            if (err.response.status === 500) showErrorAlert("Error en el servidor");
        });
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

            const data = {
                filter_name: 'date',
                scenario_id: res.data[0].id,
                project_id: localStorage.getItem("projectId"),
                filter_value: "x"
            };
    
            axios.post(`${apiUrl}/get-filters`, data, {headers})
            .then(res => {setDates(res.data); console.log(res)})
            .catch((err) => {setDates([]); console.log(err)} );
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
                <div className='d-flex w-auto justify-content-start align-items-center ms-5 gap-2 w-100'>
                    <div className='d-flex flex-column justify-content-start align-items-center gap-2 w-100'>
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
                    <div className='d-flex flex-column justify-content-start align-items-center gap-2 w-100' style={{"minWidth": "100px"}}>
                        <div className='py-1 px-2 bg-primary text-white w-100'>
                            Agrupar por
                        </div>
                        <select onChange={handleOnChangeGroup} className="form-select w-100" >
                            {group === 0 && <option defaultChecked value={0}>-----</option>}
                            <option name="Familia" value='family'>Familia</option>
                            <option name="Region" value='region'>Region</option>
                            <option name='Categoria' value='category'>Categoria</option>
                            <option name="Subcategoria" value='subcategory'>Subcategoria</option>
                            <option name="SKU" value='sku'>SKU</option>
                            <option name="Vendedor" value='salesman'>Vendedor</option>
                            <option name="Cliente" value='client'>Cliente</option>
                        </select>
                    </div>
                    <div className='d-flex flex-column justify-content-start align-items-center gap-2' style={{"minWidth": "190px"}}>
                        <div className='py-1 px-2 bg-primary text-white w-100'>
                            Fecha seleccionada
                        </div>
                        <select onChange={handleOnChangeDates} className="form-select w-100">
                            { dateFilter === 0 && <option defaultChecked value={0}>-----</option> }
                            {dates.map(date=>(
                                <option value={date}>{date}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className='px-5 w-100'>
                    <TableReport props={group} data={tableData} />
                </div>
        </main>
        </div>
    )
}

export default DetailReportPage