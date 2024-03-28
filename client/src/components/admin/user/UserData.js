import {MDBIcon} from 'mdb-react-ui-kit';

const UserData = ({props}) => {    
  return (
    <div class="container pb-2 d-flex justify-content-start align-items-center gap-4">
        <MDBIcon className='mb-3' fas icon="user" size='4x' color='primary'/>
        <div class="d-flex flex-column justify-content-start align-items-start">
            <h2 class="me-2">Bienvenido {props}</h2>
            <p>Escoja un proyecto o inicie uno nuevo</p>
        </div>
    </div>
  )
}

export default UserData