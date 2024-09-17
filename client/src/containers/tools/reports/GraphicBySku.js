import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import ReactPaginate from 'react-paginate';
import {
    MDBBtn,
    MDBModal,
    MDBModalDialog,
    MDBModalContent,
    MDBModalHeader,
    MDBModalTitle,
    MDBModalBody,
    MDBTable,
    MDBTableHead,
    MDBTableBody,
    MDBIcon,
    MDBInput
} from 'mdb-react-ui-kit';
import ModelsGraphicByProduct from "../../../components/admin/tools/reports/ModelsGraphicByProduct";

const apiUrl = process.env.REACT_APP_API_URL;
const GraphicBySku = () => {
    // AUTHORIZATION HEADERS //
    const token = localStorage.getItem("userToken");
    const headers = {
        'Authorization': `Token ${token}`, 
        'Content-Type': 'application/json', 
    };

    const [basicModal, setBasicModal] = useState(false);
    const [scenarios, setScenarios] = useState([]);
    const [scenarioId, setScenarioId] = useState(0);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null); // Estado para almacenar el producto seleccionado
    const itemsPerPage = 12;  // Número de ítems por página
    const [currentPage, setCurrentPage] = useState(0);
    const [disabledModal, setDisabledModal] = useState(true); 
    const [chartData, setChartData] = useState({});
    const [productChanged, setProductChanged] = useState(false);
    const [errorType, setErrorType] = useState(null);
    const [errors, setErrors] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); 
    const [bestModel, setBestModel] = useState("");

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
    
    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };

    const toggleOpen = () => {
        setBasicModal(!basicModal);
        getProducts(scenarioId); // Asegúrate de pasar el `scenarioId` aquí
    }

    const getProducts = (id) => {
        axios.get(`${apiUrl}/forecast/predictions-table/?sc_id=${id}`, {
            headers: headers
        })
        .then(res => {
            setProducts(res.data);
        })
        .catch(err => {
            console.log(err);
        });
    };

    const handleProductSelect = async (product) => {
        const selectedProductData = columns.reduce((acc, column) => {
            acc[column] = product[column];
            return acc;
        }, {});
        setSelectedProduct(selectedProductData); 
        setBasicModal(false);
        setProductChanged(true);
    
        try {
            const response = await axios.post(`${apiUrl}/forecast/all-models-graph`, {
                "sc_id": scenarioId,
                "product": selectedProductData
            });
            
            const data = response.data;
    
            if (data && data.models && data.dates && data.error && data.error_type && data.best_model) {
                const labels = data.dates;
                const datasets = data.models.map((model, index) => ({
                    label: model.name,
                    data: model.values,
                    borderColor: `rgba(${index * 100}, 99, 132, 0.5)`,
                    backgroundColor: `rgba(${index * 100}, 99, 132, 0.5)`,
                    fill: false,
                }));
    
                setChartData({
                    labels: labels,
                    datasets: datasets,
                });
                setBestModel(data.best_model)
                setErrorType(data.error_type);
                setErrors(data.error);

            }

        } catch (err) {
            console.log(err);
        } finally{
            setProductChanged(false);
        }
    };    

    const handleChangeScenario = (e) => {
        let id = e.target.value;
        setScenarioId(id);
        setDisabledModal(false);
        getProducts(id);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0); // Reiniciar a la primera página cuando se busca
    };

    // Filtrar productos según el término de búsqueda
    const filteredProducts = products.filter(product =>
        product.SKU.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleModelChange = (newModel) => {
        // Mostrar alerta de confirmación
        Swal.fire({
            title: 'Confirmar cambio',
            text: `¿Estás seguro de cambiar el modelo ganador a "${newModel}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, cambiar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Preparar datos
                const payload = {
                    new_model: newModel,
                    old_model: bestModel,
                    scenario_id: scenarioId,
                    product: selectedProduct
                };

                try {
                    // Hacer petición POST para cambiar el modelo
                    await axios.post(`${apiUrl}/forecast/set-best-model`, payload, { headers });

                    // Actualizar el modelo ganador localmente
                    setBestModel(newModel);

                    // Mostrar alerta de éxito
                    Swal.fire('Éxito', 'El modelo ganador ha sido cambiado.', 'success');
                } catch (error) {
                    console.error('Error al cambiar el modelo ganador:', error);
                    Swal.fire('Error', 'Ocurrió un error al cambiar el modelo ganador.', 'error');
                }
            }
        });
    };

    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredProducts.slice(startIndex, endIndex);
    const columns = ["Family", 'Category', 'Salesman', 'Subcategory', 'Client', 'Region', 'SKU', 'Description'];

    return(
        <div className="w-100 px-3 gap-2 d-flex justify-content-start flex-column align-items-start mt-5">
            <div className="d-flex w-auto justify-content-center align-items-center gap-5 px-5">
                <div className="w-auto d-flex flex-column justify-content-center align-items-start gap-1 mb-3">
                    <p className="text-primary w-auto m-0 p-0">Seleccionar Escenario</p>
                    <select className="form-select w-100 mt-2" style={{"maxWidth": "250px", "minWidth":"200px"}} onChange={handleChangeScenario}>
                        <option value={0}>-----</option>
                        {scenarios.map(item => (
                            <option key={item.id} value={item.id}>{item.scenario_name}</option>
                        ))}
                    </select>
                </div>

                <MDBBtn disabled={disabledModal} onClick={toggleOpen} className="w-auto d-flex justify-content-center align-items-center gap-2 mt-4">
                    <span className="text-white">Elegir producto</span>
                    <MDBIcon color="white" fas icon="key" />
                </MDBBtn>
            </div>

            <div className="px-5">
                <p className="text-primary">Producto: </p>
                {selectedProduct && (
                    <p>
                        {Object.entries(selectedProduct).map(([key, value]) => (
                            <span key={key}><strong className="text-primary">{key}</strong>: {value}, </span>
                        ))}
                    </p>
                )}
            </div>

            {selectedProduct !== null &&
                <div className="d-flex justify-content-between align-items-center w-100 px-5">
                    <div className="w-auto d-flex justify-content-center align-items-center gap-4 mb-3">
                        <p className="text-primary w-auto m-0 p-0">Cambiar modelo ganador</p>
                        <select 
                            className="form-select w-100 mt-2" 
                            style={{"maxWidth": "250px", "minWidth":"200px"}}
                            onChange={(e) => handleModelChange(e.target.value)}
                        >
                            <option value={null}>--------</option>
                            {errors.map((item, index) => (
                                (item.name !== 'actual' && (
                                    
                                    <option className={bestModel === item.name && "fw-bold text-success"} key={index} value={item.name}>
                                        {item.name}
                                        {bestModel === item.name && <MDBIcon fas icon="check" color="success"/> }
                                    </option>
                                ))
                            ))}
                        </select>
                    </div>
                    
                    <div className="w-auto" style={{ minWidth: "265px" }}>
                        <div className="w-100 border rounded d-flex flex-column justify-content-start align-items-start">
                            <div className="p-1 w-100" style={{ backgroundColor: "#626266" }}>
                                <h6 className="text-center text-white">{errorType === '' ? 'Error' : errorType}</h6>
                            </div>

                            {errors.map((item, index) => (
                                <div key={index} className="p-1 w-100" style={{ backgroundColor: "rgba(43, 127, 214, 0.08)" }}>
                                    {item.name !== 'actual' && (
                                        <p className="text-center text-black">
                                            <strong>{item.name}</strong> {Math.round(parseFloat(item.value) * 100) / 100}%
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            }

            <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1'>           
                <MDBModalDialog size="xl">
                    <MDBModalContent>
                        <MDBModalHeader>
                            <MDBModalTitle>Productos</MDBModalTitle>
                            <MDBBtn className='btn-close' color='none' onClick={toggleOpen}></MDBBtn>
                        </MDBModalHeader>
                        <MDBModalBody>
                            <div className="w-25 mb-5 mt-2">
                                <MDBInput 
                                    label="Buscar SKU..." 
                                    id="sku" 
                                    value={searchTerm} 
                                    onChange={handleSearchChange} // Vincular el campo de entrada al estado de búsqueda
                                />
                            </div>

                            <MDBTable hover className='w-auto'>
                                <MDBTableHead className='bg-primary'>
                                    <tr className='w-auto h-auto border'>
                                        {columns.map((column, index) => ( 
                                            <th className='text-white border text-center' key={index}>
                                                <p className="text-white">{column}</p>
                                            </th>
                                        ))}
                                        <th></th>
                                    </tr>
                                </MDBTableHead>
                                <MDBTableBody>
                                    {currentItems.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {columns.map((column, colIndex) => (
                                                <td style={{fontSize: "12px"}} key={colIndex}>{row[column]}</td>
                                            ))}
                                            <td style={{cursor: "pointer"}} onClick={() => handleProductSelect(row)}>
                                                <MDBIcon far icon="hand-point-left" color="primary" />
                                            </td>
                                        </tr>
                                    ))}
                                </MDBTableBody>
                            </MDBTable>
                            { products.length > itemsPerPage && <ReactPaginate
                                previousLabel={<MDBIcon fas icon="angle-double-left" />}
                                nextLabel={<MDBIcon fas icon="angle-double-right" />}
                                breakLabel={'...'}
                                pageCount={Math.ceil(products.length / itemsPerPage)} // Cambiado 'data.length' por 'products.length'
                                marginPagesDisplayed={2}
                                pageRangeDisplayed={5}
                                onPageChange={handlePageChange}
                                containerClassName={'pagination'}
                                activeClassName={'active'}
                            />}
                        </MDBModalBody>
                    </MDBModalContent>
                </MDBModalDialog>
            </MDBModal>

            <div className="d-flex justify-content-start align-items-center flex-column mt-3 w-100">

                { selectedProduct !== null && <ModelsGraphicByProduct data={chartData} productChanged={productChanged} /> }
            </div>

        </div>
    )
};

export default GraphicBySku;
