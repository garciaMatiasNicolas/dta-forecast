import React, { useState } from 'react';
import { MDBTable, MDBTableHead, MDBTableBody, MDBIcon, MDBModal, MDBModalDialog, MDBModalContent, MDBModalBody, MDBModalHeader, MDBModalTitle, MDBBtn } from 'mdb-react-ui-kit';
import ReactPaginate from 'react-paginate';
import DropdownFilters from './DropdownFilters';
import AnalyticsProduct from './AnalyticsProduct';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL;

const Table = ({ data, setData, scenario }) => {
  console.log(data)
  const itemsPerPage = 10;  // Número de ítems por página
  const [currentPage, setCurrentPage] = useState(0);
  const [basicModal, setBasicModal] = useState(false);
  const [selectedSKU, setSelectedSKU] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({});

  // AUTHORIZATION HEADERS //
  const token = localStorage.getItem("userToken");
  const headers = {
    'Authorization': `Token ${token}`, 
    'Content-Type': 'application/json', 
  };

  const toggleOpen = () => {
    setBasicModal(!basicModal);
  };
  
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  if (!data || data.length === 0) {
    return <div></div>;
  };

  const getStyleClass = (key, value) => {
    if (key === '¿Compro?' && value === 'Si') {
      return 'bg-success text-white';
    };

    if (key === '¿Repongo?' && value === 'Si') {
      return 'bg-success text-white';
    };

    if (key === '¿Repongo?' && value !== 'Si') {
      return 'bg-danger text-white';
    };

    if (key === '¿Compro?' && value !== 'Si') {
      return 'bg-danger text-white';
    };

    if (key === 'Estado') {
      switch (value) {
        case 'Alto sobrestock':
          return 'bg-warning text-white';
        case 'Sobrestock':
          return 'bg-primary text-white';
        case 'Normal':
          return 'bg-success text-white';
        case 'Quiebre':
          return 'bg-danger text-white';
        case 'Obsoleto':
          return 'bg-secondary text-black';
        default:
          return '';
      }
    };

    if (key === 'Caracterización'){
      switch (value) {
        case '0-Con stock sin ventas':
          return 'bg-danger text-white';
        case '1-Más de 360 días':
          return 'bg-danger text-white';
        case '2-Entre 180 y 360':
          return 'bg-warning text-white';
        case '3-Entre 90 y 180':
          return 'bg-warning text-white';
        case '4-Entre 30 y 90':
          return 'bg-success text-white';
        case '5-Entre 15 y 30':
          return 'bg-success text-white';
        case '6-Menos de 15':
          return 'bg-primary text-white';
        default:
          return '';
      }
    }

    return '';
  };

  
  const renderTableRows = () => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    const slicedData = data.slice(start, end);
  
    return slicedData.map((item, index) => (
      <tr key={index}>
        {Object.entries(item).map(([key, value]) => (
          <td
            className={`border text-center ${getStyleClass(key, value)}`}
            key={key}
            onClick={() => handleClick(item)} // Pasar el objeto completo
          >
            {value}
          </td>
        ))}
      </tr>
    ));
  };

  const handleClick = (item) => {
    if (item.SKU) {
      setSelectedSKU(item.SKU);
  
      const filteredItem = {
        Family: item.Familia === "null" && scenario !== null && scenario !== false ? 0 : item.Familia,
        Category: item.Categoria === "null" && scenario !== null && scenario !== false ? 0 : item.Categoria,
        Subcategory: item.Subcategoria === "null" && scenario !== null && scenario !== false ? 0 : item.Subcategoria,
        Client: item.Cliente === "null" && scenario !== null && scenario !== false ? 0 : item.Cliente,
        Salesman: item.Vendedor === "null" && scenario !== null && scenario !== false ? 0 : item.Vendedor,
        Region: item.Región === "null" && scenario !== null && scenario !== false ? 0 : item.Región,
        SKU: item.SKU === "null" && scenario !== null && scenario !== false ? 0 : item.SKU,
        Description: item.Descripción == "null" && scenario !== null && scenario !== false ? 0 : item.Descripción,
      };
      console.log(filteredItem)
      axios.post(`${apiUrl}/forecast/product-all`, {
        product: filteredItem,  // Aquí se envía el objeto completo
        scenario_pk: scenario,
        project_pk: localStorage.getItem("projectId")
      }, { headers })
      .then(res => setAnalyticsData(res.data))
      .catch(err => console.log(err));
  
      toggleOpen();
    }
  }

  const keys = ["Familia", 'Categoria', 'Vendedor', 'Subcategoria', 'Cliente', 'Región', '¿Compro?', 'MTO', 'OB', 'ABC', 'XYZ', 'Estado', 'Caracterización', '¿Repongo?', 'ABC en $ Total', 'ABC Cliente', 'ABC en $ por Categoria']

  return (
    <>
    
      <div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} className='d-flex justify-content-start align-items-start flex-column w-100'>
        <MDBTable hover className='w-auto'>
          <MDBTableHead className='bg-primary'>
            <tr className='w-auto h-auto border'>
              {Object.keys(data[0]).map((key, index) => (
                <th className='text-white border text-center' key={index}>
                  {keys.includes(key) ? 
                    <DropdownFilters key={index} name={key} data={data} setFilterData={setData} isOrderBy={key === "Valorizado" || key === "Sobrante valorizado" || key === "Sobrante (unidades)"}/> : 
                    <p>{key}</p>
                  }
                </th>
              ))}
            </tr>
          </MDBTableHead>
          <MDBTableBody>
            {renderTableRows()}
          </MDBTableBody>
        </MDBTable>

        <MDBModal show={basicModal} setShow={setBasicModal}>
          <MDBModalDialog size='xl'>
            <MDBModalContent>
              <MDBModalHeader>
                <MDBModalTitle className='text-black'>Analytics Producto {selectedSKU}</MDBModalTitle>
                <MDBBtn className='btn-close' color='none' onClick={toggleOpen}></MDBBtn>
              </MDBModalHeader>
              <MDBModalBody>
                <AnalyticsProduct data={analyticsData} />
              </MDBModalBody>
            </MDBModalContent>
          </MDBModalDialog>
        </MDBModal>
      </div> 

      { data.length > itemsPerPage && <ReactPaginate
        previousLabel={<MDBIcon fas icon="angle-double-left" />}
        nextLabel={<MDBIcon fas icon="angle-double-right" />}
        breakLabel={'...'}
        pageCount={Math.ceil(data.length / itemsPerPage)}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageChange}
        containerClassName={'pagination'}
        activeClassName={'active'}
      />}
    </>
  );
};

export default Table;