import {
  MDBCard,
  MDBCardTitle,
  MDBTable, 
  MDBTableBody,
  MDBCardBody,
  MDBRow,
  MDBCol,
  MDBIcon
} from 'mdb-react-ui-kit';

const ProfileInfo = ({data}) => {
  return (
    <MDBCard className='w-100 p-4'>
      <MDBRow className='g-0'>
        <MDBCol md='4'>
          <MDBIcon fas icon="user" size='9x' color='primary' className='mt-5'/>
        </MDBCol>
        <MDBCol md='8'>
          <MDBCardBody>
            <MDBCardTitle className="fw-bolder">Informacion de usuario</MDBCardTitle>
            <MDBTable borderless>
              <MDBTableBody>
                <tr>
                  <th className="fw-bold">Email: </th>
                  <td>{data.email}</td>
                </tr>
                <tr>
                  <th className="fw-bold">Nombre: </th>
                  <td>{data.first_name}</td>
                </tr>
                <tr>
                  <th className="fw-bold">Apellido: </th>
                  <td>{data.last_name}</td>
                </tr>
              </MDBTableBody>
            </MDBTable>
          </MDBCardBody>
        </MDBCol>
      </MDBRow>
    </MDBCard>
  )
}

export default ProfileInfo