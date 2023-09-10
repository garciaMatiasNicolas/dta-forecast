import { MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';
import Projects from '../../components/admin/projects/Projects';


const ProjectsContainer = ({projects}) => {
  

  return (
    <MDBTable align='middle' className='container'>
      <MDBTableHead>
        <tr>
          <th scope='col' className='fw-bold'>Nombre del proyecto y creador</th>
          <th scope='col' className='fw-bold'>Estado</th>
          <th scope='col' className='fw-bold'>Fecha de creacion</th>
          <th scope='col' className='fw-bold'>Acciones</th>
        </tr>
      </MDBTableHead>
      <MDBTableBody>
        {projects.map(item => (
          <Projects key={item.id} props={item} />
        ))}
      </MDBTableBody>
    </MDBTable>
  );
}

export default ProjectsContainer