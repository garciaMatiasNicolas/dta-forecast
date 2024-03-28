import { useState } from 'react';
import { MDBTable, MDBTableHead, MDBTableBody, MDBIcon } from 'mdb-react-ui-kit';
import ReactPaginate from 'react-paginate';

const itemsPerPage = 7; // Cantidad de elementos por página

const TableMape = ({ errortype, data }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const offset = currentPage * itemsPerPage;
  const currentData = data.slice(offset, offset + itemsPerPage);

  const pageCount = Math.ceil(data.length / itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <div>
      <MDBTable hover>
        <MDBTableHead light>
          <tr>
            <th scope='col'>Producto</th>
            <th scope='col' className='col-2'>Venta Real</th>
            <th scope='col' className='col-2'>Venta Predecida</th>
            <th scope='col' className='col-2'>{errortype}</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {currentData.map((record, index) => (
            <tr key={index}>
              <th>{record[0]}</th>
              <td className='col-2'>{record[1]}</td>
              <td className='col-2'>{record[2]}</td>
              <td className='col-2'>%{record[3]}</td>
            </tr>
          ))}
        </MDBTableBody>
      </MDBTable>
            
      <ReactPaginate
        pageCount={pageCount}
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
  );
}

export default TableMape;
