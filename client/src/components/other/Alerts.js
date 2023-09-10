import Swal from "sweetalert2";

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