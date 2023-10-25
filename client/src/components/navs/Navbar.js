import { Link } from "react-router-dom";
import LogOutButton from "../users/LogOutButton";
import UserProfileBtn from "../admin/user/UserProfileBtn";
import {
    MDBContainer,
    MDBNavbar,
    MDBNavbarBrand
} from 'mdb-react-ui-kit';
import logo from "../../assets/logonav.png";

const Navbar = () => {
  return (
    <MDBNavbar light bgColor='primary' className=".shadow-5">

        <MDBContainer className="w-100 justify-content-between align-items-center">
            <Link to='/dashboard/'> 
                <MDBNavbarBrand  className="w-auto">
                    <h5 className="text-white fw-bold">DTA-FORECAST</h5>
                </MDBNavbarBrand>
            </Link>

            <MDBContainer className='w-auto m-0 d-flex justify-content-center align-items-center gap-2'>
                <Link to="/profile/" className="d-flex justify-content-center align-items-center gap-2 text-decoration-none">
                    <p className="text-white mt-3">Matias Garcia</p>
                    <UserProfileBtn/>
                </Link>
                <LogOutButton/>
            </MDBContainer>

        </MDBContainer>

    </MDBNavbar>
  )
}

export default Navbar