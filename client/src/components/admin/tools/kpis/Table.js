import React from 'react';
import { MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';

const TableReport = ({props, data}) => {
  if (!data || !data.data) {
    return( 
    <div>
      <p>Selecciona todos los filtros para visualizar los datos... </p>
      <p>(Nota: Los escenarios mostrados son para el proyecto seleccionado)</p>
    </div>
    )
  }
  
  return (
    <MDBTable>
      <MDBTableHead light>
        <tr>
          <th scope='col'>{props}</th>
          {
            data.length === 0 ? 
              <>
                <th scope='col'></th>
                <th scope='col'></th>
                <th scope='col'></th>
                <th scope='col'></th>
              </>
            :
              data.years.map(year => (<th scope='col'>{year}</th>))
          }
        </tr>
      </MDBTableHead>
      <MDBTableBody>
      {
          data.length === 0 ?  
            <tr>
              <th scope='row'></th>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          :
            data.data.map((rowData, index) => (
              <tr key={index}>
                <th scope='row'>{rowData[0]}</th>
                {rowData.slice(1).map((value, yearIndex) => (
                  <td key={yearIndex}>{value}</td>
                ))}
              </tr>
            ))
        }
       
      </MDBTableBody>
    </MDBTable>
  );
}

export default TableReport