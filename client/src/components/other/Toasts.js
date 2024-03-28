import Swal from "sweetalert2";

const showToast = (text, type) => { 
    Swal.fire({
        text: text,
        icon: type,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        toast: true
    });
}

export default showToast;