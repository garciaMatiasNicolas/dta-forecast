import { MDBInput } from 'mdb-react-ui-kit';
import photo from "../assets/confirmation.png";
import logo from "../assets/logowhite.png";

const ResetPasswordPage = () => {

    return (
        <div className="w-100 h-100 d-flex justify-center align-items-center gap-5">
            <img src={photo} style={{"maxWidth": "600px"}}/>
            <div className="d-flex justify-content-between align-items-center w-auto bg-white rounded">
                
                <form className="w-100 p-5 bg-white">
                    <h5 className="text-center mb-4">Resetee su contraseña</h5>
                    <div className="form-outline mb-4">
                        <MDBInput label='Email registrado' id='email' type='email' name='email' autoComplete='off' required/>
                    </div>

                    <div className="form-outline mb-4">
                        <MDBInput label='Nueva contraseña' id='first_pass' type='password' name='first_pass' required/>
                    </div>

                    <div className="form-outline mb-4">
                        <MDBInput label='Repita contraseña' id='new_password' type='password' name='new_password' required/>
                    </div>
                    
                    <button type="submit" className="btn btn-primary btn-block mb-4 d-flex justify-content-center align-items-center gap-2">
                        <span>Resetear</span>
                    </button>
                </form>
                
                <div className="w-50 d-flex justify-content-center align-items-center">
                    <img style={{"maxWidth": "300px"}} className="w-auto" src={logo} />
                </div>
            </div>
        </div>
    )
}

export default ResetPasswordPage