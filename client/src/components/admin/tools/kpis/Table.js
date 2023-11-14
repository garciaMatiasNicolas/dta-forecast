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

  useEffect(()=>{
    if (data.data !== undefined && data.data.length < 7){
      setCurrentPage(0);
    }
  }, [props])
  

  if (!data || !data.data) {
    return( 
    <div>
      <p>Selecciona todos los filtros para visualizar los datos... </p>
      <p>(Nota: Los escenarios mostrados son para el proyecto seleccionado)</p>
    </div>
    )
  }

  return (
    <div>
      <MDBTable>
        <MDBTableHead light>
          <tr>
            <th scope='col'>{props}</th>
            {data.length === 0 ? (
              <>
                <th scope='col'></th>
                <th scope='col'></th>
                <th scope='col'></th>
                <th scope='col'></th>
              </>
            ) : (
              data.years.map((year) => <th scope='col'>{year}</th>)
            )}
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {currentPageData.map((rowData, index) => (
            <tr key={index}>
              <th scope='row'>{rowData[0]}</th>
              {rowData.slice(1).map((value, yearIndex) => (
                <td key={yearIndex}>{value}</td>
              ))}
            </tr>
          ))}
        </MDBTableBody>
      </MDBTable>
      {
        data.data.length >= 6 && 
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
      }
    </div>
  );
};

export default TableReport;
