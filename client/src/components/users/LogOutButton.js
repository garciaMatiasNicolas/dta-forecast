import axios from 'axios';
import { MDBBtn, MDBIcon } from 'mdb-react-ui-kit';
import { showErrorAlert } from '../other/Alerts';

const apiUrl = process.env.REACT_APP_API_URL;

const LogOutButton = () => {
    const executeLogOut = (tokenUser) => {
        axios.post( `${apiUrl}/users/authentication/logout?token=${tokenUser}`)
        .then(response => {
            console.log(response)
            localStorage.clear();
            window.location.reload();
        })
        .catch(error => {
            console.log(error)
            showErrorAlert("Ha ocurrido un error inesperado, intente nuevamente")
        })
    }

    const handleClick = () => {
        let tokenStored = localStorage.getItem("userToken");
        executeLogOut(tokenStored);
    }

  return (
    <MDBBtn onClick={handleClick} className='mx-2' tag='a' color='white' outline floating>
        <MDBIcon fas icon='power-off' color='white'/>
    </MDBBtn>
  )
}

export default LogOutButton