import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MDBInput,  } from 'mdb-react-ui-kit';
import { showErrorAlert, showSuccessAlert } from "../other/Alerts";
import axios from "axios";
import { ClipLoader } from "react-spinners";

const apiUrl = process.env.REACT_APP_API_URL;

const SignUpForm = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: ''
    });
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const fetchData = () => {
        axios.post(`${apiUrl}/users/create`, formData)
        .then((response) => {
            if (response.data.error) {
                showErrorAlert("Email en uso, utilice otro o inicie sesion")
                console.error(response.data);
            } else {
                showSuccessAlert("Verifique su correo electrónico para validar su email y luego inicie sesión.", "Registro exitoso")
                setTimeout(()=>{
                    navigate("/login/");
                }, 2000)
            }
        })
        .catch((error)=>{
            showErrorAlert("Algo fallo, intente mas tarde");
        })
        .finally(() => {
            setLoading(false);
        });
    }
    
    const handleSubmit = (e) => {
        e.preventDefault();
        fetchData();
    };

  return (
    <form onSubmit={handleSubmit} className="border rounded p-5 bg-white">

        <div className="row mb-4">
            <div className="col">
                <MDBInput 
                    value={formData.first_name} 
                    onChange={handleChange} 
                    type="text" name='first_name' id="name" className="form-control border" 
                    label= "Nombre"
                    required
                />
            </div>

            <div className="col">
                <MDBInput 
                    value={formData.last_name}
                    onChange={handleChange} 
                    type="text" name='last_name' id="last_name" className="form-control border" 
                    label="Apellido"
                    required
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
            />
        </div>

        <div className="form-outline mb-4">
            <MDBInput name="first_pass" type="password" id="first_pass" className="form-control border" label="Contraseña"/>
        </div>

        <div className="form-outline mb-4">
            <MDBInput 
                value={formData.password} 
                onChange={handleChange} 
                name="password" type="password" id="password" className="form-control border" 
                label="Repita contraseña"
                required
            />
        </div>

        <button type="submit" className="btn btn-primary btn-block mb-4 d-flex justify-content-center align-items-center gap-2">
            <span>Inicia sesion</span>
            { loading && <ClipLoader color="#ffffff" loading={loading} size={15} /> } 
        </button>

        <div className="text-center">
            <p>¿Ya tienes cuenta? <Link to='/login/'>Inicia sesion</Link> </p>
        </div>
    
    </form>
      
  )
}

export default SignUpForm