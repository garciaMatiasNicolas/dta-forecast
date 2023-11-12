import axios from "axios";
import Swal from "sweetalert2";

const apiUrl = process.env.REACT_APP_API_URL;

const showErrorAlert = (error) => {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: error,
  });
};

const showSuccessAlert = (message, title) => {
  Swal.fire({
    icon: 'success',
    title: title,
    text: message,
  });
};

const showConifmationAlert = (typeOfConfirmation, objectId) => {

  const token = localStorage.getItem("userToken");
  const headers = {
    'Authorization': `Token ${token}`, 
    'Content-Type': 'application/json', 
  };

  if (typeOfConfirmation === "scenario"){
    Swal.fire({
      text: '¿Estás seguro de eliminar este escenario? Se borrarán todas las predicciones relacionadas a él.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`${apiUrl}/scenarios/${objectId}`, {headers})
        .then(()=>{showSuccessAlert("El escenario y sus predicciones fueron eliminados satisfactoriamente", "Escenario eliminado")})
        .catch(()=>{showErrorAlert("Ocurrio un error inesperado, intente mas tarde")});
      }
    });
  }
  else if (typeOfConfirmation === "file"){

  }
}

export {showErrorAlert, showSuccessAlert, showConifmationAlert}