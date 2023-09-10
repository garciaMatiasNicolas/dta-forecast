import { Link } from "react-router-dom";
import LogOutButton from "../users/LogOutButton";
import UserProfileBtn from "../admin/user/UserProfileBtn";
import {
    MDBContainer,
    MDBNavbar,
    MDBNavbarBrand
} from 'mdb-react-ui-kit';

const Navbar = () => {
  return (
    <MDBNavbar light bgColor='primary' className=".shadow-5">

        <MDBContainer className="w-100 justify-content-between align-items-center">
            <Link to='/dashboard/'> 
                <MDBNavbarBrand  className="w-auto">
                    <img
                    src='https://mdbootstrap.com/img/logo/mdb-transaprent-noshadows.webp'
                    height='30'
                    alt=''
                    loading='lazy'
                    />
                </MDBNavbarBrand>
            </Link>

            <MDBContainer className='w-auto m-0'>
                <Link to="/profile/" className="text-decoration-none">
                    <UserProfileBtn/>
                </Link>
                <LogOutButton/>
            </MDBContainer>

        </MDBContainer>

    </MDBNavbar>
  )
}

export default Navbar