import { MDBInput } from "mdb-react-ui-kit";


const ProfileUpdate = () => {
  return (
    <div className="d-flex justify-content-between align-items-start flex-column">
        <h2 className="mb-2">Elija que campos desea actualizar</h2>
        <form className="p-4 bg-white w-100 d-">

            <div className="form-outline mb-4 w-50">
                <MDBInput 
                    name="email" type="email" id="email" className="form-control border" 
                    label = "Actualizar Email" required
                />
            </div>

            <div className="d-flex justify-content-bewteen align-items-center w-100">
                <div className="form-outline mb-4 w-50">
                    <MDBInput 
                        name="first_name" type="text" id="first_name" className="form-control border" 
                        label = "Actualizar Nombre" required
                    />
                </div>
            </div>

            <div className="form-outline mb-4 w-50">
                <MDBInput 
                    name="last_name" type="text" id="last_name" className="form-control border" 
                    label = "Actualizar Apellido" required
                />
            </div>

            <div className="form-outline mb-4 w-50">
                <MDBInput 
                    name="password" type="password" id="password" className="form-control border" 
                    label = "Contraseña" required
                />
            </div>

            <div className="d-flex justify-content-center align-items-center">
                <button type="submit" className="btn btn-primary btn-block mb-4 d-flex justify-content-center align-items-center gap-2 w-50">
                    <span>Actualizar Datos</span>
                </button>
            </div>

        </form>
    </div>
  )
}

export default ProfileUpdate