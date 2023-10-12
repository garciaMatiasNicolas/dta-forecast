import axios from "axios"
import { useEffect, useState } from "react"
import { showErrorAlert } from "../components/other/Alerts"
import Navbar from "../components/navs/Navbar"
import ProfileDataContainer from "../containers/admin/ProfileDataContainer";

const apiUrl = process.env.REACT_APP_API_URL;

const Profile = () => {
  
  const [userData, setUserData] = useState({})

  const fetchDataProfile = () => {
    const userPk = localStorage.getItem("userPk");
    const token = localStorage.getItem("userToken");
    const headers = {
      'Authorization': `Token ${token}`, 
      'Content-Type': 'application/json', 
    };
    
    axios.get(`${apiUrl}/users/detail/${userPk}`, {headers})
    .then(res => {
      setUserData(res.data)
    })
    .catch(err =>{
      showErrorAlert("Sesion expirada. Debe iniciar sesion")
      localStorage.clear();
    })
  }
  
  useEffect(() => {
    fetchDataProfile();
  }, [])
  
  return (
    <div>
      <Navbar/>
      <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-center gap-3 align-items-center p-3 bg-white">
        <ProfileDataContainer dataProfile={userData} />
      </main> 
    </div>
  )
}

export default Profile