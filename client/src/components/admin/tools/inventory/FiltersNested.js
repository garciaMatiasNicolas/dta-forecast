import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { showErrorAlert } from "../../../other/Alerts";
import {
    MDBBtn,
    MDBIcon,
    MDBInput,
} from 'mdb-react-ui-kit';
import Table from "./TableWithAvg";
import { AppContext } from '../../../../context/Context';
import TotalTable from "./TotalTable";
import TrafficLightContainer from "../../../../containers/tools/inventory/TrafficLightContainer";

const apiUrl = process.env.REACT_APP_API_URL;

const FiltersNested = ({data, trafficLight, stockParams, scenario, is_drp, resetFilters}) => {
    const [orderedData, setOrderedData] = useState(data);
    const {optionsFilterTable, setOptionsFilterTable} = useContext(AppContext);
    const [viewTrafficLight, setViewTrafficLight] = useState(false);

    // Function for download excel
    const handleDownload = (urlPath) => {
        const link = document.createElement("a");
        link.href = `${apiUrl}/${urlPath}`;
        link.download = is_drp ? `DRP.xlsx` : "Reapro.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExport = () => {
        const dataToSend = {
            "columns": Object.keys(data[0]),
            "rows": orderedData.map(obj => Object.values(obj)),
            "file_name": is_drp ? `DRP` : "Reapro" ,
            "project_pk": parseInt(localStorage.getItem("projectId"))
        };
          
        axios.post(`${apiUrl}/export_excel`, dataToSend, {
            headers: {
                'Authorization': `Token ${localStorage.getItem("userToken")}`, 
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            let file_path = res.data.file_url;
            handleDownload(file_path);
        })
        .catch(err => {
            showErrorAlert(err.response.data); 
            console.log(err);
        });  
    };

    const handleSearchProduct = (event) => {
        const inputValue = event.target.value.toLowerCase(); 
        const filteredData = data.filter(item => item.SKU.toLowerCase().includes(inputValue));
        setOrderedData(filteredData);
    };

    const handleSetFilters = () => {
        setOrderedData(data);
        setOptionsFilterTable([]);
    };

    useEffect(()=>{
        resetFilters && setOptionsFilterTable([]);
    }, [resetFilters])

    if (!data || data.length === 0) {
        return <div></div>;
    }
    
    return (
        <div className="w-100 gap-4 d-flex justify-content-start align-items-start flex-column">
            <h5 className='text-primary'>
                {is_drp ? "DRP por producto" : (!viewTrafficLight ? "Tabla de stock por producto" : "Semáforo de stock")}
            </h5>
            {!is_drp && (
                <p style={{'cursor': 'pointer'}} onClick={() => setViewTrafficLight(!viewTrafficLight)} className='text-primary'>
                    {!viewTrafficLight ? "Ver semáforo" : "Ver reapro"}
                </p>
            )}
            
            {viewTrafficLight && !is_drp ? (
                <TrafficLightContainer data={trafficLight} params={stockParams}/> 
            ) : (
                <>
                    <MDBBtn 
                        className="w-auto" 
                        style={{ backgroundColor: '#25d366' }} 
                        onClick={handleExport}
                        disabled={orderedData.length === 0}
                    > 
                        Exportar como Excel
                        <MDBIcon className="ms-2" fas icon="file-export" />
                    </MDBBtn> 
        
                    <div className="w-100 d-flex justify-content-between align-items-center">
                        <div className="w-auto d-flex justify-content-between align-items-center gap-2">
                            <MDBInput
                                type="text"
                                label="SKU"
                                className="w-auto"
                                onChange={handleSearchProduct}
                            />
                        </div>
                    </div>
        
                    <div className="d-flex w-100 justify-content-between align-items-center">
                        <div className='d-flex justify-content-start align-items-center gap-5 w-auto'>
                            {optionsFilterTable.map((opt, index) => (
                                Object.entries(opt).map(([key, value]) => (
                                    <p key={index} className='text-primary'>{`${key}: ${value}`}</p>
                                ))
                            ))}
                        </div>
        
                        <p style={{"cursor": "pointer"}} onClick={handleSetFilters}>Reestablecer filtros</p>
                    </div>
        
                    <Table data={orderedData} setData={setOrderedData} scenario={scenario}/>
                    
                    {!is_drp && <TotalTable data={orderedData}/>}
                </>
            )}
        </div>
    );
};

export default FiltersNested;