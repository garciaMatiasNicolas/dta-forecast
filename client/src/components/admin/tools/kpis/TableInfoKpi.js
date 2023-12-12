import React, { useState } from 'react';
import { MDBTable, MDBTableHead, MDBTableBody, MDBIcon } from 'mdb-react-ui-kit';
import ReactPaginate from 'react-paginate';

const TableComponent = ({ props, data }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 7;

  const offset = currentPage * itemsPerPage;
  const currentItems = data.slice(offset, offset + itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

 /*  if (!data || !data.data) {
    return( 
    <div>
      <p>Selecciona todos los filtros para visualizar los datos... </p>
      <p>(Nota: Los escenarios mostrados son para el proyecto seleccionado)</p>
    </div>
    )
  } */

  return (
    <div style={{"overflowX": 'auto', "whiteSpace": 'nowrap'}}>
      <MDBTable hover className='w-auto'>
        <MDBTableHead className='bg-primary'>
          <tr>
            <th scope='col' className='text-white'>{props}</th>
            <th scope='col' className='text-white'>YTD</th>
            <th scope='col' className='text-white'>QTD</th>
            <th scope='col' className='text-white'>MTG</th> 
            <th scope='col' className='text-white'>YTG</th>
            <th scope='col' className='text-white'>QTG</th>
            <th scope='col' className='text-white'>MTG</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {currentItems.map((row, index) => (
            <tr key={index}>
              <td>{row[0]}</td>
              <td>% {row[1]}</td>
              <td>% {row[2]}</td>
              <td>% {row[3]}</td>
              <td>% {row[4]}</td>
              <td>% {row[5]}</td>
              <td>% {row[6]}</td>
            </tr>
          ))}
        </MDBTableBody>
      </MDBTable>
      {
        data.length >= 6 &&

        <ReactPaginate
          previousLabel={<MDBIcon fas icon="angle-double-left" />}
          nextLabel={<MDBIcon fas icon="angle-double-right" />}
          breakLabel={'...'}
          pageCount={Math.ceil(data.length / itemsPerPage)}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageClick}
          containerClassName={'pagination'}
          subContainerClassName={'pages pagination'}
          pageClassName={'page-item'}
          activeClassName={'active text-decoration-underline'}
        />
      }
    </div>
  );
};

export default TableComponent;


