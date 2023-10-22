import React, { useEffect, useState } from 'react'
import Navbar from '../../components/navs/Navbar'
import ToolsNav from '../../components/navs/ToolsNav'
import axios from 'axios';
import TableReport from '../../components/admin/tools/kpis/Table';

const apiUrl = process.env.REACT_APP_API_URL;

const DetailReportPage = () => {
    // AUTHORIZATION HEADERS //
    const token = localStorage.getItem("userToken");
    const headers = {
        'Authorization': `Token ${token}`, 
        'Content-Type': 'application/json', 
    };

    const [scenarios, setScenarios] = useState([]);
    const [scenarioId, setScenarioId] = useState(0);

    const [dates, setDates] = useState([]);

    const [group, setGroup] = useState("");

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
        .then(res => setDates(res.data))
        .catch(() => {setDates([])});
    }

    const handleOnChangeGroup = (e) => {
        let value = e.target.value;
        setGroup(value);
    }

    const handleOnChangeDates = () => {
  
    }
    
    useEffect(() => {
        axios.get(`${apiUrl}/scenarios/`, {
        headers: headers
        })
        .then(res => {
            setScenarios(res.data);
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
                <div className='d-flex w-auto justify-content-start align-items-center ms-5 gap-2'>
                    <div className='d-flex flex-column justify-content-start align-items-center gap-2'>
                        <div className='py-1 px-2 bg-primary text-white'>
                            Escenario seleccionado
                        </div>
                        <select className="form-select w-auto" style={{"minWidth": "190px"}} onChange={handleOnChangeScenario}>
                            <option value={0}>-----</option>
                            {scenarios.map((scenario) => (
                            <option value={scenario.id}>{scenario.scenario_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className='d-flex flex-column justify-content-start align-items-center gap-2'>
                        <div className='py-1 px-2 bg-primary text-white' style={{"minWidth": "190px"}}>
                            Agrupar por
                        </div>
                        <select onChange={handleOnChangeGroup} className="form-select w-auto" style={{"minWidth": "190px"}}>
                            <option defaultChecked id="Familia" value='family'>Familia</option>
                            <option name="Region" value='region'>Region</option>
                            <option name='Categoria' value='category'>Categoria</option>
                            <option name="Subcategoria" value='subcategory'>Subcategoria</option>
                            <option name="SKU" value='sku'>SKU</option>
                            <option name="Vendedor" value='salesman'>Vendedor</option>
                            <option name="Cliente" value='client'>Cliente</option>
                        </select>
                    </div>
                    <div className='d-flex flex-column justify-content-start align-items-center gap-2'>
                        <div className='py-1 px-2 bg-primary text-white' style={{"minWidth": "190px"}}>
                            Fecha seleccionada
                        </div>
                        <select className="form-select w-auto" style={{"minWidth": "190px"}}>
                            {
                                dates.length === 0 && <option defaultChecked>-------</option>
                            }
                            
                            {dates.map(date=>(
                                <option value={date}>{date}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className='px-5 w-100'>
                    <TableReport props={group}/>
                </div>
        </main>
        </div>
    )
}

export default DetailReportPage