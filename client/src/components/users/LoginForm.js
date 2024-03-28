import axios from "axios";
import { MDBInput } from "mdb-react-ui-kit";
import { useState } from "react";
import { Link, useNavigate  } from "react-router-dom";
import { showErrorAlert } from "../other/Alerts";
import { ClipLoader } from "react-spinners";
import logo from "../../assets/logowhite.png"

const apiUrl = process.env.REACT_APP_API_URL;

const LoginForm = () => {
    const navigate = useNavigate();

    const [data, setData] = useState({
        username: "",
        password: ""
    })

    const [loading, setLoading] = useState(false);
    
    const handleOnchange = (e) => {
        const {name, value} = e.target;
        setData({
            ...data,
            [name]: value
        })
    }
    
    const fetchData = () => {
        setLoading(true);

        axios.post(`${apiUrl}/users/authentication/login`, data)
        .then(response => {
            const {token, user_id} = response.data
            localStorage.setItem("userToken", token);
            localStorage.setItem("userPk", user_id);
            navigate("/dashboard/")
        })
        .catch(error => {
            error.response === undefined && showErrorAlert("Error en el servidor, intente mas tarde"); 
            error.response.data.error === "credentials_invalids" && showErrorAlert("Email o contraseña incorrectos");
            error.response.data.error === "user_not_found" && showErrorAlert("El email proporcionado no esta registrado");
            error.response.data.error === "user_inactive" && showErrorAlert("Su usuario esta inactivo, debe confirmar su mail para loguearse");
            console.log(error.response.data.error);
        })
        .finally(() => {
            setLoading(false);
        });

    }

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchData();
    }
    

  return (
    <div className="d-flex justify-content-between align-items-center w-auto bg-white rounded">
        <form onSubmit={handleSubmit} className="p-5 bg-white">

            <div className="form-outline mb-4">
                <MDBInput 
                    value={data.username}
                    onChange={handleOnchange}
                    name="username" type="email" id="username" className="form-control border" 
                    label = "Email"
                    required
                    autoComplete="off"
                />
            </div>

            <div className="form-outline mb-4">
                <MDBInput 
                    value={data.password}
                    onChange={handleOnchange}
                    name="password" type="password" id="password" className="form-control border" 
                    label = "Contraseña"
                    required
                    autoComplete="off"
                />
            </div>

            <div className="mb-4 d-flex justify-content-center align-items-center">
                <div>
                    <a href="#!" className="text-center">¿Olvidaste tu contraseña?</a>
                </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block mb-4 d-flex justify-content-center align-items-center gap-2">
                <span>Inicia sesion</span>
                { loading && <ClipLoader color="#ffffff" loading={loading} size={15} /> } 
            </button>

            <div className="text-center">
                <p>¿No creaste tu cuenta todavia? <Link to='/signup/'>Creala!</Link> </p>
            </div>
            
        </form>
        <div className="w-50 d-flex justify-content-center align-items-center">
            <img style={{"maxWidth": "300px"}} className="w-auto" src={logo} alt="logo"/>
        </div>
    </div>
  )
}

export default LoginForm