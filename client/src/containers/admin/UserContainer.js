import UserData from "../../components/admin/user/UserData"
import { useEffect, useState} from "react"
import axios from "axios";
import { showErrorAlert } from "../../components/other/Alerts";
import { useNavigate } from "react-router-dom";
import CreateProjectBtn from "../../components/admin/projects/CreateProjectBtn";

const apiUrl = process.env.REACT_APP_API_URL;

const UserContainer = ({createProject}) => {
    const [fullname, setFullname] = useState('');
    
    let token = localStorage.getItem("userToken");
       
    let navigate = useNavigate();

    useEffect(() => {
        let user= localStorage.getItem("userPk");

        const headers = {
            'Authorization': `Token ${token}`, 
            'Content-Type': 'application/json', 
        };

        axios.get(`${apiUrl}/users/detail/${user}`, { headers })
        .then(response => {
            setFullname(`${response.data.first_name} ${response.data.last_name}`);
        })
        .catch(error => {
            showErrorAlert("Su sesion ha expirado, debe iniciar sesion nuevamente");
            localStorage.clear();
            navigate("/login/");
        });
    }, [])

  return (
    <div className="w-75 d-flex justify-content-between align-items-center border-bottom">
        <UserData props={fullname}/>
        <CreateProjectBtn createProject={createProject}/>
    </div>
  )
}

export default UserContainer