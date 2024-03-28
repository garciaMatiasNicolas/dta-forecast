import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MDBInput,  } from 'mdb-react-ui-kit';
import { showErrorAlert, showSuccessAlert } from "../other/Alerts";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import logo from "../../assets/logowhite.png"

const apiUrl = process.env.REACT_APP_API_URL;

const SignUpForm = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        first_pass: '',
        password: ''
    });
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const fetchData = (data) => {
        setLoading(true);
        axios.post(`${apiUrl}/users/create`, data)
        .then(() => {
            showSuccessAlert("Verifique su correo electrónico para validar su email y luego inicie sesión.", "Registro exitoso")
            setTimeout(()=>{
                navigate("/login/");
            }, 2000)
        })
        .catch((error)=>{
            error.response.data.logs.email && showErrorAlert("Email en uso, intente con otro o inicie sesión");  
            error.status === 500 && showErrorAlert("Algo fallo, intente mas tarde");
        })
        .finally(() => {
            setLoading(false);
        });
    }
    
    const handleSubmit = (e) => {
        e.preventDefault();
    
        if (formData.first_pass !== formData.password) {
            showErrorAlert(`Las contraseñas no coinciden. Por favor, inténtelo de nuevo ${formData.first_pass} != ${formData.password}`);
            return;
        }

        const { first_pass, ...formDataWithoutFirstPass } = formData;

        fetchData(formData);
    };

  return (
    <div className="d-flex justify-content-between align-items-center w-auto bg-white rounded">
        <form onSubmit={handleSubmit} className="p-5 bg-white">

            <div className="row mb-4">
                <div className="col">
                    <MDBInput 
                        value={formData.first_name} 
                        onChange={handleChange} 
                        type="text" name='first_name' id="name" className="form-control border" 
                        label= "Nombre"
                        required
                        autoComplete="off"
                    />
                </div>

                <div className="col">
                    <MDBInput 
                        value={formData.last_name}
                        onChange={handleChange} 
                        type="text" name='last_name' id="last_name" className="form-control border" 
                        label="Apellido"
                        required
                        autoComplete="off"
                    />
                </div>
            </div>

            <div className="form-outline mb-4">
                <MDBInput 
                    value={formData.email} 
                    onChange={handleChange} 
                    name="email" type="email" id="email" className="form-control border" 
                    label="Email"
                    required
                    autoComplete="off"
                />
            </div>

            <div className="form-outline mb-4">
                <MDBInput name="first_pass" 
                type="password" id="first_pass" 
                className="form-control border" 
                value={formData.first_pass} 
                onChange={handleChange} 
                label="Contraseña" autoComplete="off"/>
            </div>

            <div className="form-outline mb-4">
                <MDBInput 
                    value={formData.password} 
                    onChange={handleChange} 
                    name="password" type="password" id="password" className="form-control border" 
                    label="Repita contraseña"
                    required
                    autoComplete="off"
                />
            </div>

            <button type="submit" className="btn btn-primary btn-block mb-4 d-flex justify-content-center align-items-center gap-2">
                <span>Registrate</span>
                { loading && <ClipLoader color="#ffffff" loading={loading} size={15} /> } 
            </button>

            <div className="text-center">
                <p>¿Ya tienes cuenta? <Link to='/login/'>Inicia sesion</Link> </p>
            </div>
        
        </form>
        <div className="w-50 d-flex justify-content-center align-items-center">
            <img style={{"maxWidth": "300px"}} className="w-auto" src={logo} />
        </div>
    </div>
      
  )
}

export default SignUpForm