import { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import { MDBTable, MDBTableHead, MDBTableBody, MDBIcon } from 'mdb-react-ui-kit';

const TableReport = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 7; 

  const pageCount = data.length > 0 ? Math.ceil(data.length / itemsPerPage) : 0;
  const offset = currentPage * itemsPerPage;
  const currentPageData = data.slice(offset, offset + itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  useEffect(() => {
    if (data.length < 7) {
      setCurrentPage(0);
    }
  }, [data]);

  if (data.length === 0) {
    return (
      <div>
        <p>Selecciona todos los filtros para visualizar los datos...</p>
        <p>(Nota: Los escenarios mostrados son para el proyecto seleccionado)</p>
      </div>
    );
  }

  // Obtener los nombres de las columnas desde la primera fila de datos
  const columns = Object.keys(data[0]).reverse();

  // Separar la última fila de la tabla
  const lastRow = currentPageData[currentPageData.length - 1];

  return (
    <div>
      <MDBTable className='w-auto' hover>
        <MDBTableHead className='bg-primary'>
          <tr>
            {columns.map((col, index) => (
              <th key={index} scope='col' className='text-white'>{col}</th>
            ))}
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {currentPageData.map((rowData, index) => (
            <tr className='w-auto' key={index}>
              {columns.map((col, colIndex) => (
                <td className='w-auto border' key={colIndex}>{rowData[col]}</td>
              ))}
            </tr>
          ))}
        </MDBTableBody>
      </MDBTable>
      {data.length >= 6 && (
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

