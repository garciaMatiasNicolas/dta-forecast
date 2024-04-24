import { useEffect, useState } from 'react'
import {MDBTable, MDBTableBody, MDBTableHead, MDBIcon} from "mdb-react-ui-kit";
import { showErrorAlert, showSuccessAlert } from '../../../other/Alerts';
import Swal from "sweetalert2";
import ReactPaginate from 'react-paginate';
import axios from 'axios';
import ModalOtherInfo from './ModalOtherInfo';

const apiUrl = process.env.REACT_APP_API_URL;

const ScenariosHistory = ({scenarioList}) => {

    const token = localStorage.getItem("userToken");
    const headers = {
        'Authorization': `Token ${token}`, 
        'Content-Type': 'application/json', 
    };

    // STATES//
    const [scenarios, setScenarios] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 3; // Cantidad de elementos por página
    const indexOfLastItem = (currentPage + 1) * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = scenarioList.length === 0 ? scenarios.slice(indexOfFirstItem, indexOfLastItem) : scenarioList.slice(indexOfFirstItem, indexOfLastItem)

    // USE EFFECT //
    useEffect(() => {    
        // Get all scenarios and set state on first render
        updateScenarioList();
    }, []);

    const handleDeleteScenario = (objectId) => {
        Swal.fire({
            text: '¿Estás seguro de eliminar este escenario? Se borrarán todas las predicciones relacionadas a él.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar'
          }).then((result) => {
            
            if (result.isConfirmed) {
              axios.delete(`${apiUrl}/scenarios/${objectId}`, {headers})
              .then(()=>{
                showSuccessAlert("El escenario y sus predicciones fueron eliminados satisfactoriamente", "Escenario eliminado");
                updateScenarioList();
              })
              .catch(()=>{showErrorAlert("Ocurrio un error inesperado, intente mas tarde");});
            }
        });
    };

    const handleUpdateScenario = async (objectId) => {
        const { value: scenarioName } = await Swal.fire({
            title: "Actualizar Escenario",
            input: "text",
            inputLabel: "Ingrese nuevo nombre del escenario",
            inputPlaceholder: "Nombre escenario"
        });

        if (scenarioName) {
            const data = { "scenario_name": scenarioName };

            axios.put(`${apiUrl}/scenarios/${objectId}/`, data, {headers})
            .then(()=>{showSuccessAlert("El escenario se actualizo satisfactoriamente", "Escenario actualizado"); updateScenarioList();})
            .catch(()=>{showErrorAlert("Ocurrio un error inesperdo, intente nuevamente")});

        } else {
            showErrorAlert("Debe ingresar un nuevo nombre");
        }
    };

    const updateScenarioList = () => {
        axios.get(`${apiUrl}/scenarios/`, {
            headers: headers
        })
        .then(res => {
            let projectId = parseInt(localStorage.getItem("projectId"))
            let scenarios = res.data.filter(item => item.project === projectId);
            setScenarios(scenarios);
        })
        .catch(() => {
            showErrorAlert("Ocurrio un error inesperado, intente mas tarde");
        });
    }

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    // Function for download excel
    const handleDownload = (scenarioName, urlPath) => {
        const link = document.createElement("a");
        link.href = `${apiUrl}/${urlPath}`;
        link.download = `predicciones_${scenarioName}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

  return (
    <div className="w-100 ms-5 mb-5 mt-5" style={{"maxWidth": "900px"}}>
        <p style={{"cursor": "pointer", "color": "#285192"}}>
            <MDBIcon fas icon="history" /> Ver historial de escenarios
        </p>
        <MDBTable className='caption-top' hover>
            <MDBTableHead className="bg-primary">
            <tr>
                <th scope='col' className="text-white">ID</th>
                <th scope='col' className="text-white">Escenario</th>
                <th scope='col' className="text-white">Excel</th>
                <th scope='col' className="text-white">Archivo</th>
                <th scope='col' className="text-white">Acciones</th>
            </tr>
            </MDBTableHead>
            <MDBTableBody>
                {currentItems.length === 0 ? (
                    <tr>
                    <th scope='row'></th>
                    <td>No hay escenarios</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    </tr>
                ) : (
                    currentItems.map((scenario) => (
                    <tr key={scenario.id}>
                        <th scope='row'>{scenario.id}</th>
                        <td>{scenario.scenario_name}</td>
                        <td
                        style={{ cursor: 'pointer' }}
                        onClick={() =>
                            handleDownload(
                            scenario.scenario_name,
                            scenario.url_predictions
                            )
                        }
                        >
                        <MDBIcon fas icon='file-excel' /> Excel Predicciones
                        </td>
                        <td>Historical Data</td>
                        <td>
                            <span
                                onClick={() => handleDeleteScenario(scenario.id)}
                                style={{ cursor: 'pointer' }}
                                className='me-2'
                            >
                                <MDBIcon fas icon='trash-alt' color='danger' />
                            </span>
                            <span
                                onClick={() => handleUpdateScenario(scenario.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <MDBIcon fas icon='edit' color='success' />
                            </span>
                            <ModalOtherInfo scenarioInfo={scenario}/>
                        </td>
                    </tr>
                    ))
                )}
            </MDBTableBody>
        </MDBTable>
        <ReactPaginate
            pageCount={Math.ceil(scenarios.length / itemsPerPage)}
            pageRangeDisplayed={5}
            marginPagesDisplayed={2}
            onPageChange={handlePageClick}
            containerClassName={'pagination'}
            subContainerClassName={'pages pagination'}
            activeClassName={'active'}
            previousLabel={<MDBIcon fas icon="angle-double-left" />}
            nextLabel={<MDBIcon fas icon="angle-double-right" />}
        />
    </div>
  )
}

export default ScenariosHistory
