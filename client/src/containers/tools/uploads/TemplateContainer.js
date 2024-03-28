import { MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';
import Templates from '../../../components/admin/tools/uploads/Templates';
import templates from '../../../data/templates';


const TemplateContainer = () => {

  return (
    <MDBTable align='start' className='container'>
      <MDBTableHead className='bg-secondary'>
        <tr>
          <th scope='col' className='fw-bold text-white'>Plantillas</th>
          <th scope='col' className='fw-bold d-flex justify-content-end text-white'>Acciones</th>
        </tr>
      </MDBTableHead>
      <MDBTableBody>
        {templates.map(item => (
          <Templates key={item.id} props={item} />
        ))}
      </MDBTableBody>
    </MDBTable>
  );
}

export default TemplateContainer