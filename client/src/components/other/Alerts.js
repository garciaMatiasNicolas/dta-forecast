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
    Swal.fire({
      text: '¿Estás seguro de eliminar este archivo? Se borrarán todas las predicciones relacionadas a él.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`${apiUrl}/files/${objectId}`, {headers})
        .then(()=>{showSuccessAlert("El archivo y sus predicciones fueron eliminados satisfactoriamente", "Archivo eliminado")})
        .catch(()=>{showErrorAlert("Ocurrio un error inesperado, intente mas tarde")});
      }
    });
  }
}

const updateAlert = async (objectId) => {
  const token = localStorage.getItem("userToken");
  const headers = {
    'Authorization': `Token ${token}`, 
    'Content-Type': 'application/json', 
  };

  const { value: scenarioName } = await Swal.fire({
    title: "Actualizar Escenario",
    input: "text",
    inputLabel: "Ingrese nuevo nombre del escenario",
    inputPlaceholder: "Nombre escenario"
  });
  if (scenarioName) {
    axios.put(`${apiUrl}/scenarios/${objectId}`, {
      data: {
        "scenario_name": scenarioName
      }, 
      headers: headers
    })
    .then(()=>{showSuccessAlert("El escenario se actualizo satisfactoriamente", "Escenario actualizado")})
    .catch(()=>{showErrorAlert("Ocurrio un error inesperdo, intente nuevamente")})
  } else {
    showErrorAlert("Debe ingresar un nuevo nombre")
  }
}

export {showErrorAlert, showSuccessAlert, showConifmationAlert, updateAlert}