import { Link } from "react-router-dom";
import LogOutButton from "../users/LogOutButton";
import UserProfileBtn from "../admin/user/UserProfileBtn";
import {
    MDBContainer,
    MDBNavbar,
    MDBNavbarBrand
} from 'mdb-react-ui-kit';
import logo from "../../assets/logonav.png";
import { useEffect, useState } from "react";
import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

const Navbar = () => {
    const userId = localStorage.getItem("userPk");
    const token = localStorage.getItem("userToken");
    const headers = {
        'Authorization': `Token ${token}`, 
        'Content-Type': 'application/json', 
    };

    const [fullname, setFullname] = useState("");

    useEffect(() => {
        axios.get(`${apiUrl}/users/detail/${userId}`, {headers})
        .then(res => setFullname(`${res.data.first_name} ${res.data.last_name}`))
        .catch(err => console.log(err.response));
    }, []);
    

  return (
    <MDBNavbar light bgColor='primary' className=".shadow-5">

        <MDBContainer className="w-100 justify-content-between align-items-center">
            <Link to='/dashboard/'> 
                <MDBNavbarBrand  className="w-auto">
                    <h5 className="text-white fw-bold">DTA-F&IO</h5>
                </MDBNavbarBrand>
            </Link>

            <MDBContainer className='w-auto m-0 d-flex justify-content-center align-items-center gap-2'>
                <Link to="/profile/" className="d-flex justify-content-center align-items-center gap-2 text-decoration-none">
                    <p className="text-white mt-3">{fullname}</p>
                    <UserProfileBtn/>
                </Link>
                <LogOutButton/>
            </MDBContainer>

        </MDBContainer>

    </MDBNavbar>
  )
}

export default Navbar