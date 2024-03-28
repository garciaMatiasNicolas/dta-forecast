import Swal from "sweetalert2";

const showErrorAlert = (error) => {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: error,
  });
};

const showAlertAfterExecutionScenario = (icon, title, text) => {
  Swal.fire({
    icon: icon,
    title: title,
    text: text,
    allowOutsideClick: false, 
    allowEscapeKey: false,    
    allowEnterKey: false,     
    showConfirmButton: true,  
    confirmButtonText: 'OK',  
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.reload();
    }
  })
}

const showSuccessAlert = (message, title) => {
  Swal.fire({
    icon: 'success',
    title: title,
    text: message,
  });
};

const showWariningAlert = (message, title) => {
  Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
  });
}

const showOrderByAlert = (columns) => {
  Swal.mixin({
    title: 'Ordenar Por',
    showCancelButton: true,
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    html: `
      <label for="columnSelect">Columna:</label>
      <select id="columnSelect" class="swal2-select">
        ${columns.map(column => `<option value="${column}">${column}</option>`).join('')}
      </select>
      <label for="orderSelect">Orden:</label>
      <select id="orderSelect" class="swal2-select">
        <option value="Ascendente">Ascendente</option>
        <option value="Descendente">Descendente</option>
      </select>
    `,
    preConfirm: () => {
      const columnSelect = Swal.getPopup().querySelector('#columnSelect').value;
      const orderSelect = Swal.getPopup().querySelector('#orderSelect').value;
      // Aquí puedes realizar acciones con las selecciones
      console.log('Columna seleccionada:', columnSelect);
      console.log('Orden seleccionado:', orderSelect);
    }
  }).fire();
};

export {showErrorAlert, showSuccessAlert, showWariningAlert, showAlertAfterExecutionScenario, showOrderByAlert}