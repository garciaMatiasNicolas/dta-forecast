import { MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';
import Projects from '../../components/admin/projects/Projects';


const ProjectsContainer = ({projects, deleteProject, updateProject}) => {

  return (
    <div style={{ maxHeight: '300px', overflowY: 'auto', width: '100%' }}>
      <MDBTable align='middle' className='container' style={{ width: '100%' }}>
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
            <Projects key={item.id} props={item} deleteProject={deleteProject} updateProject={updateProject}/>
          ))}
        </MDBTableBody>
      </MDBTable>
    </div>
  );
}

export default ProjectsContainer