import { useState } from "react";
import { filters } from "../../../../data/filters";
import axios from "axios";
import { showErrorAlert, showWariningAlert } from "../../../other/Alerts";
import {
    MDBBtn,
    /* MDBModal,
    MDBModalDialog,
    MDBModalContent,
    MDBModalHeader,
    MDBModalTitle,
    MDBModalBody,
    MDBModalFooter, */
    MDBIcon,
    MDBInput,
} from 'mdb-react-ui-kit';
import Table from "./TableWithAvg";
import Swal from "sweetalert2";

const apiUrl = process.env.REACT_APP_API_URL;

const FiltersNested = ({data, params}) => {
    /* 
    const [filterValues, setFilterValues] = useState([]); */
/*     const [selectedFilter, setSelectedFilter] = useState([]); */
/*     const [groupsSelected, setGroupsSelected] = useState([]); */
    const [isOrdering, setIsOrdering] = useState(false);
    const [isFilter, setIsFilter] = useState(false);
    const [orderedData, setOrderedData] = useState(data);
/*     const [selectedFilterValue, setSelectedFilterValue] = useState([]); */
/*     const [group, setGroup] = useState("none");  */
/*     const [basicModal, setBasicModal] = useState(false); */
    const [isDataFiltered, setIsDataFiltered] = useState(false);
    
    /* const toggleOpen = () => {setBasicModal(!basicModal);} */
    
/*     // Function to get stock data // 
    const fetchStockData = (order, filters) => {
        axios.post(`${apiUrl}/forecast/stock-data`, {project_id: localStorage.getItem("projectId"), order: order, filters: filters, type: "stock by product", params: params}, 
        { headers: {
            'Authorization': `Token ${localStorage.getItem("userToken")}`,
            'Content-Type': 'application/json'
        }})
        .then(res => {setOrderedData(res.data.data);})
        .catch(err => {err.response.data.error === "historical_data_none" ? showErrorAlert("No hay datos históricos") : showErrorAlert("Ocurrio un error inesperado");})
        .finally(()=> { setIsFilter(false); setIsOrdering(false) });
    }; */

/*     // Function to remove all the filters and get data
    const removeAllFilters = () => {
        setGroupsSelected([]);
        setSelectedFilterValue([]);
        setSelectedFilter([]);
        setIsFilter(true);
        setIsDataFiltered(false);
        fetchStockData("", "");
    };
 */
    /* // setGroup on change filter select
    const handleOnChangeGroup = (e) => {
        setGroup(e.target.value);
    };
     */
   /*  // Handle onchange filter
    const handleOnchangeFilter = (e) => {
        let groupSelected = {[e.target.name]: e.target.value}
        setSelectedFilter([...selectedFilter, e.target.name]);
        setSelectedFilterValue([...selectedFilterValue, e.target.value]);
        setGroupsSelected([...groupsSelected, groupSelected]);
        setGroup("none");
        e.target.value = "none"
    }; */
/* 
    // Delete filter already selected
    const deleteFilterVal = (index) => {
        setGroupsSelected(prevGroupsSelected => {
            const updatedGroupsSelected = prevGroupsSelected.filter((_, i) => i !== index);
            updatedGroupsSelected.length > 0 ? fetchStockData("", updatedGroupsSelected) : removeAllFilters(); 
            setIsFilter(true);
            setIsDataFiltered(true);
            updatedGroupsSelected.length > 0 && setIsDataFiltered(true);
            return updatedGroupsSelected;
        });
    }; */

/*     // Show alert for ordering
    const handleAlertOrderBy = () => {
        Swal.mixin({
            title: 'Ordenar Por',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            html: `
              <label for="columnSelect">Columna:</label>
              <select id="columnSelect" class="swal2-select">
                ${Object.keys(data[0]).map(column => `<option value="${column}">${column}</option>`).join('')}
              </select>
              <label for="orderSelect">Orden:</label>
              <select id="orderSelect" class="swal2-select">
                <option value="asc">Ascendente</option>
                <option value="desc">Descendente</option>
              </select>
            `,
            preConfirm: () => {
                let columnSelect = Swal.getPopup().querySelector('#columnSelect').value;
                const orderSelect = Swal.getPopup().querySelector('#orderSelect').value;
                let order = {[columnSelect]: orderSelect};
                let filters = isDataFiltered ? groupsSelected : "";

                setIsOrdering(true);
                fetchStockData(order, filters);
            }

        }).fire();
    }; */
    
    /* // Show filters from backend
    const handleOnClickFilter = (e) => {

        if (selectedFilter.length === 0) {
            const data = {
                filter_name: e.target.name,
                project: localStorage.getItem("projectId")
            };
        
            axios.post(`${apiUrl}/forecast/get-filters-historical`, data, {  
                headers: {
                    'Authorization': `Token ${localStorage.getItem("userToken")}`, 
                    'Content-Type': 'application/json'
                }
            }).then(res => setFilterValues(res.data))
            .catch(() => showErrorAlert("Error en el servidor al traer los filtros"));

        } else {
            const data = {
                filter_name: e.target.name,
                project_id: localStorage.getItem("projectId"),
                groups: groupsSelected
            };
            
            axios.post(`${apiUrl}/forecast/filters-nested`, data, {  
                headers: {
                    'Authorization': `Token ${localStorage.getItem("userToken")}`, 
                    'Content-Type': 'application/json'
                }
            }).then(res => setFilterValues(res.data))
            .catch(() => showErrorAlert("Error en el servidor al traer los filtros"));
        }
    };

    // Filter table with the selected filters
    const handleFilterTable = () => {
        setIsFilter(true);
        setIsDataFiltered(true);
        setBasicModal(!basicModal);
        fetchStockData("", groupsSelected);
    }; */

    // Export like excel
    const handleExport = () => {
        const dataToSend = {
            "columns": Object.keys(data[0]),
            "rows": orderedData.map(obj => Object.values(obj)),
            "file_name": `StockPorProducto`,
            "project_pk": parseInt(localStorage.getItem("projectId"))
        };
          
        axios.post(`${apiUrl}/export_excel`, dataToSend, {
            headers: {
                'Authorization': `Token ${localStorage.getItem("userToken")}`, 
                'Content-Type': 'application/json'
            },
            responseType: 'blob'
        })
        .then(res => {
            // Crear un blob a partir de la respuesta
            const file = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
            // Crear una URL para el blob
            const fileURL = URL.createObjectURL(file);
    
            // Crear un enlace y simular un clic para iniciar la descarga
            const a = document.createElement('a');
            a.href = fileURL;
            a.download = 'StockData'; // Nombre del archivo que se descargará
            document.body.appendChild(a);
            a.click();
    
            // Limpiar el enlace y el blob después de la descarga
            window.URL.revokeObjectURL(fileURL);
            document.body.removeChild(a);
        })
        .catch(err => {showErrorAlert(err.response.data); console.log(err)});  
    };

    const handleSearchProduct = (event) => {
        const inputValue = event.target.value.toLowerCase(); 
        const filteredData = data.filter(item => item.Producto.toLowerCase().includes(inputValue));
        setOrderedData(filteredData);
    };

    if (!data || data.length === 0) {
        return <div></div>;
    };
    
    return (
        <div className="w-100 gap-4 d-flex justify-content-start align-items-start flex-column">
            <h5 className='text-primary'>Tabla de stock por producto</h5>

            <MDBBtn 
                className="w-auto" 
                style={{ backgroundColor: '#25d366' }} 
                onClick={handleExport}
                disabled={orderedData.length === 0}
                > Exportar como Excel
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
                    
                   {/*  <MDBBtn className="text-center" onClick={toggleOpen}>Filtros</MDBBtn> */}
                </div>
                
                {/* <MDBModal show={basicModal} setShow={setBasicModal}  tabIndex='-1' staticBackdrop>
                    <MDBModalDialog>
                        <MDBModalContent>
                            <MDBModalHeader>
                                <MDBModalTitle>Filtros Anidados</MDBModalTitle>
                            </MDBModalHeader>
                            <MDBModalBody>
                                <div className='d-flex justify-content-start align-items-center gap-2' onChange={handleOnChangeGroup}>
                                    <p className='text-primary'>Grupo:</p>
                                    <select className="form-select w-auto mb-3" >
                                        <option value="none">-----</option>
                                        <option value="Family" disabled={selectedFilter.includes('Family')}>Familia</option>
                                        <option value="Category" disabled={selectedFilter.includes('Category')}>Categoria</option>
                                        <option value="Salesman" disabled={selectedFilter.includes('Salesman')}>Vendedor</option>
                                        <option value="Client" disabled={selectedFilter.includes('Client')}>Cliente</option>
                                        <option value="Subcategory" disabled={selectedFilter.includes('Subcategory')}>Subcategoria</option>
                                        <option value="Region" disabled={selectedFilter.includes('Region')}>Region</option>
                                    </select>
                                </div>
                                {filters.map(item => (
                                    item.name === group && (
                                    <div key={item.name} className="d-flex justify-content-start align-items-center gap-1 w-auto">
                                        <p className="text-primary">{item.label}:</p>
                                        <select name={item.name} className="form-select w-auto mb-3" onClick={handleOnClickFilter} 
                                        onChange={handleOnchangeFilter}>
                                            <option defaultValue="">------</option>
                                            {filterValues.map(item => (
                                                <option key={item} value={item}>{item}</option>
                                            ))}
                                        </select>
                                    </div>)
                                ))} 
                            </MDBModalBody>

                            <MDBModalFooter>
                                <MDBBtn color='secondary' onClick={toggleOpen} >
                                    Cerrar
                                </MDBBtn>
                                <MDBBtn onClick={handleFilterTable}>Filtrar</MDBBtn>
                            </MDBModalFooter>
                        </MDBModalContent>
                    </MDBModalDialog>
                </MDBModal>
                <p className="text-primary mt-4" onClick={handleAlertOrderBy} style={{cursor:'pointer'}}>Ordenar por</p> */}
            </div>

         {/*    {groupsSelected.length > 0 &&
                <div className="w-100 d-flex justify-content-start align-items-center gap-3 px-3">
                    <p className="text-primary">Filtros: </p>
                
                    <div className="w-100 d-flex justify-content-start alignt-items-center gap-3">
                        {groupsSelected.map((item, index)=>(
                            <div className="d-flex justify-content-center align-items-center gap-1 w-auto">
                                {Object.entries(item).map(([key, value]) => (
                                    <>
                                        <p className="text-primary">{key}:</p>
                                        <p className="text-primary">{value}</p>
                                    </>
                                ))}
                                <MDBIcon
                                    onClick={()=>{deleteFilterVal(index)}} 
                                    style={{cursor:'pointer'}} 
                                    className="mb-3" 
                                    fas icon="times" 
                                    color="primary"
                                    name={item}
                                />
                            </div>
                        ))}
                    </div>

                    <p className="text-danger" style={{cursor: "pointer"}} onClick={removeAllFilters}>Borrar filtros</p>
                </div>
            } */}
            
            <Table data={orderedData} isOrdering={isOrdering} isFilter={isFilter} setData={setOrderedData}/>
        </div>
    );
}


export default FiltersNested;