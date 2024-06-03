import { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import { MDBTable, MDBTableHead, MDBTableBody, MDBIcon } from 'mdb-react-ui-kit';

const TableReport = ({ props, data }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 7; // Cambia esto al número de elementos que desees mostrar por página.

  const pageCount = data.data !== undefined && Math.ceil(data.data.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentPageData = data.data !== undefined && data.data.slice(offset, offset + itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  useEffect(() => {
    if (data.data !== undefined && data.data.length < 7) {
      setCurrentPage(0);
    }
  }, [props, data.data]);

  if (!data || !data.data) {
    return (
      <div>
        <p>Selecciona todos los filtros para visualizar los datos... </p>
        <p>(Nota: Los escenarios mostrados son para el proyecto seleccionado)</p>
      </div>
    );
  }

  // Separar la última fila de la tabla
  const lastRow = data.data[data.data.length - 1];

  return (
    <div>
      <MDBTable className='w-auto' hover>
        <MDBTableHead className='bg-primary'>
          <tr>
            <th scope='col' className='text-white'>{props}</th>
            {data.columns.length === 0 ? (
              <>
                <th scope='col'></th>
                <th scope='col'></th>
                <th scope='col'></th>
                <th scope='col'></th>
              </>
            ) : (
              data.columns.map((year, index) => <th key={index} scope='col' className='text-white'>{year}</th>)
            )}
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {currentPageData.slice(0, -1).map((rowData, index) => (
            <tr className='w-auto' key={index}>
              <th scope='row' className='w-auto border'>{rowData.name === 0 ? `Sin ${props}` : rowData.name}</th>
              {data.columns.map((year, yearIndex) => (
                <td className='w-auto border' key={yearIndex}>{rowData[year]}</td>
              ))}
            </tr>
          ))}
          <tr className='bg-success w-auto'>
            <th scope='row' className='text-white'>{lastRow.name}</th>
            {data.columns.map((year, yearIndex) => (
              <td className='text-white' key={yearIndex}>{lastRow[year]}</td>
            ))}
          </tr>
        </MDBTableBody>
      </MDBTable>
      {data.data.length >= 6 && (
        <ReactPaginate
          previousLabel={<MDBIcon fas icon="angle-double-left" />}
          nextLabel={<MDBIcon fas icon="angle-double-right" />}
          breakLabel={'...'}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageClick}
          containerClassName={'pagination'}
          subContainerClassName={'pages pagination'}
          pageClassName={'page-item'}
          activeClassName={'active text-decoration-underline'}
        />
      )}
    </div>
  );
};

export default TableReport;

