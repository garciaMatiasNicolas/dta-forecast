import React from 'react';
import { MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';

const TableReport = ({props}) => {
  return (
    <MDBTable>
      <MDBTableHead light>
        <tr>
          <th scope='col'>Agrupacion: {props}</th>
          <th scope='col'>Actual</th>
          <th scope='col'>Forecast</th>
        </tr>
      </MDBTableHead>
      <MDBTableBody>
        <tr>
          <th scope='row'>1</th>
          <td>Mark</td>
          <td>Otto</td>
        </tr>
        <tr>
          <th scope='row'>2</th>
          <td>Jacob</td>
          <td>Thornton</td>
        </tr>
        <tr>
          <th scope='row'>3</th>
          <td>Larry</td>
          <td>the Bird</td>
        </tr>
      </MDBTableBody>
    </MDBTable>
  );
}

export default TableReport