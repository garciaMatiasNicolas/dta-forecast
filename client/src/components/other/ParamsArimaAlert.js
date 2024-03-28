import Swal from "sweetalert2";

const ParamsArimaAlert = async () => {
  return await Swal.fire({
    title: 'Parametros adicionales del modelo ARIMA-SARIMA',
    html: `
      <div class="mb-3">
        <label for="inputP" class="form-label">Orden del componente de autoregresión estacional</label>
        <input id="inputP" class="form-control" placeholder="Ingrese P" />
      </div>

      <div class="mb-3">
        <label for="inputD" class="form-label">Grado de diferenciación estacional</label>
        <input id="inputD" class="form-control" placeholder="Ingrese D" />
      </div>

      <div class="mb-3">
        <label for="inputQ" class="form-label">Orden del componente de media móvil estacional</label>
        <input id="inputQ" class="form-control" placeholder="Ingrese Q" />
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Confirmar parametros adicionales',
    cancelButtonText: 'Dejar valores por defecto',
    showLoaderOnConfirm: true,
    allowOutsideClick: false,
    preConfirm: () => {
      const pValue = document.getElementById('inputP').value;
      const dValue = document.getElementById('inputD').value;
      const qValue = document.getElementById('inputQ').value;

      if (!pValue || !dValue || !qValue) {
        Swal.showValidationMessage('Ingrese todos los valores.');
        return false; // Detiene el cierre del modal si falta algún valor
      }

      return { value: { pValue, dValue, qValue } };
    },
  });
};

export default ParamsArimaAlert;