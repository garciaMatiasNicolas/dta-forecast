import { MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';
import Templates from '../../../components/admin/tools/uploads/Templates';


const TemplateContainer = () => {
  

  return (
    <MDBTable align='middle' className='container'>
      <MDBTableHead>
        <tr>
          <th scope='col' className='fw-bold'>Plantillas</th>
          <th scope='col' className='fw-bold'>Acciones</th>
        </tr>
      </MDBTableHead>
      <MDBTableBody>
      
      </MDBTableBody>
    </MDBTable>
  );
}

export default TemplateContainer