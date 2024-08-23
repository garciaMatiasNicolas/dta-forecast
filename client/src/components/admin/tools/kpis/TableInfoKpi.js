import React, { useState } from 'react';
import { MDBTable, MDBTableHead, MDBTableBody, MDBIcon } from 'mdb-react-ui-kit';
import ReactPaginate from 'react-paginate';

const TableComponent = ({ props, data, itemsPerPage = 7 }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const lastRow = data[data.length - 1];
  const paginatedData = data.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} className='d-flex justify-content-start align-items-start flex-column'>
      <MDBTable hover className='w-auto'>
        <MDBTableHead className='bg-primary'>
          <tr>
            <th scope='col' className='text-white'>{props}</th>
            <th scope='col' className='text-white'>YTD</th>
            <th scope='col' className='text-white'>QTD</th>
            <th scope='col' className='text-white'>MTD</th>
            <th scope='col' className='text-white'>FYTD</th>
            <th scope='col' className='text-white'>YTG</th>
            <th scope='col' className='text-white'>QTG</th>
            <th scope='col' className='text-white'>MTG</th>
            <th scope='col' className='text-white'>FYTG</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {paginatedData.slice(0, -1).map((rowData, index) => (
            <tr key={index}>
              <th className='w-auto border' scope='row'>{rowData[0] === 0 ? `Sin ${props}` : rowData[0]}</th>
              {rowData.slice(1).map((value, yearIndex) => (
                <td
                  className='w-auto border'
                  key={yearIndex}
                  style={{
                    backgroundColor:
                      yearIndex < 4 ? 'rgba(255, 99, 132, 0.5)' : 'rgba(53, 162, 235, 0.5)',
                  }}
                >
                  {value}%
                </td>
              ))}
            </tr>
          ))}
          <tr className='bg-success w-auto'>
            <th scope='row' className='text-white'>{lastRow[0]}</th>
            {lastRow.slice(1).map((value, yearIndex) => (
              <td
                className='text-white'
                key={yearIndex}
              >
                {value}%
              </td>
            ))}
          </tr>
        </MDBTableBody>
      </MDBTable>

      {data.length >= 6 && (
        <ReactPaginate
          previousLabel={<MDBIcon fas icon='angle-double-left' />}
          nextLabel={<MDBIcon fas icon='angle-double-right' />}
          breakLabel={'...'}
          pageCount={Math.ceil(data.length / itemsPerPage)}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageChange}
          containerClassName={'pagination'}
          subContainerClassName={'pages pagination'}
          pageClassName={'page-item'}
          activeClassName={'active text-decoration-underline'}
        />
      )}
    </div>
  );
};

export default TableComponent;


