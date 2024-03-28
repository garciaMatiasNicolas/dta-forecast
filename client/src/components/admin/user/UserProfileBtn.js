import { MDBBtn, MDBIcon } from 'mdb-react-ui-kit';

const UserProfileBtn = () => {
  return (
    <MDBBtn floating tag='a' color='secondary' outline>
      <MDBIcon fas icon="user-cog" color='white'/>
    </MDBBtn>
  );
}

export default UserProfileBtn