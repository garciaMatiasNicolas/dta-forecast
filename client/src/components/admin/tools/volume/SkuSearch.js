import { MDBBtn, MDBIcon, MDBModal, MDBModalBody, MDBModalContent, MDBModalDialog, MDBModalHeader, MDBModalTitle } from "mdb-react-ui-kit";
import { useState } from "react";
import { showErrorAlert } from "../../../other/Alerts";
import axios from "axios";
import ReactPaginate from "react-paginate";

const apiUrl = process.env.REACT_APP_API_URL;

const SkuSearch = ({setSku, scenarioId, itemsPerPage = 15}) => {
    // AUTHORIZATION HEADERS //
    const token = localStorage.getItem("userToken");
    const headers = {
        'Authorization': `Token ${token}`, 
        'Content-Type': 'application/json', 
    };

    const [basicModal, setBasicModal] = useState(false);
    const [skus, setSkus] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [skuSelected, setSkuSelected] = useState("");

    const handlePageChange = ({ selected }) => {
        setCurrentPage(selected);
    };

    const paginatedData = skus.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const toggleOpen = () => {
        setBasicModal(!basicModal);
        !basicModal && getSkusFromApi();
    };

    const getSkusFromApi = () => {
        const data = {
            filter_name: "SKU",
            scenario_id: scenarioId,
            project_id: localStorage.getItem("projectId") ,
            filter_value: "x"
        };
        
        axios.post(`${apiUrl}/forecast/get-filters`, data, { headers })
        .then(res => setSkus(res.data))
        .catch(err => {
            err.response.data.logs.error[0] === "scenario_id_not_provided" ? showErrorAlert("Debe proveer un escenario") : showErrorAlert("Error al traer los filtros");
            console.log(err.response);
        });
    }

    const handleClickSku = (item) => {
        setBasicModal(!basicModal);
        setSkuSelected(item);
        
        const dataFilter = {
            filter_name: "SKU",
            scenario_id: scenarioId,
            project_id: localStorage.getItem("projectId"),
            filter_value: item.split(' ')[0]
        };
      
        axios.post(`${apiUrl}/forecast/filter-data`, dataFilter,{ headers })
        .then(res => {
            let graphicLineData =  res.data.full_data;
            let graphicBarData = res.data.year_data;
            setSku(graphicBarData.other_data.x, graphicLineData.other_data.x, graphicBarData.other_data.y, graphicLineData.other_data.y, graphicBarData.actual_data.y, graphicLineData.actual_data.y);
        })
        .catch(err => showErrorAlert(`Ocurrio un error`));
    };

    return (
        <div>
            <MDBBtn color="tertiary" className="d-flex juistify-content-center align-items-center gap-3 w-auto" onClick={toggleOpen}>
                <MDBIcon icon="key" fas size="lg" color="black"/>
                <p className="fs-6 mt-3 text-black">SKU</p>
                <MDBIcon icon="angle-down" fas size="lg" color="black"/>
                <p className="mt-3">{skuSelected}</p>
            </MDBBtn>

            <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1'>
                <MDBModalDialog size="lg">
                    <MDBModalContent>
                        <MDBModalHeader>
                            <MDBModalTitle>SKU's</MDBModalTitle>
                            <MDBBtn className="btn-close" color='none' onClick={toggleOpen}></MDBBtn>
                        </MDBModalHeader>

                        <MDBModalBody>
                   
                            {paginatedData.map(item=>(
                                <p className="text-black" style={{cursor: "pointer"}} onClick={()=>{handleClickSku(item)}}>SKU: {item}</p>
                            ))}
                
                            <ReactPaginate
                                previousLabel={<MDBIcon fas icon="angle-double-left" />}
                                nextLabel={<MDBIcon fas icon="angle-double-right" />}
                                breakLabel={'...'}
                                pageCount={Math.ceil(skus.length / itemsPerPage)}
                                marginPagesDisplayed={2}
                                pageRangeDisplayed={5}
                                onPageChange={handlePageChange}
                                containerClassName={'pagination'}
                                subContainerClassName={'pages pagination'}
                                pageClassName={'page-item'}
                                activeClassName={'active text-decoration-underline'}
                            />
                        </MDBModalBody>
                    </MDBModalContent>
                </MDBModalDialog>
            </MDBModal>
        </div>
    );
};

export default SkuSearch;