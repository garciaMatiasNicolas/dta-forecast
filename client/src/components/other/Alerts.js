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


export {showErrorAlert, showSuccessAlert}