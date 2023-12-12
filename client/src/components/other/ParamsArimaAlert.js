import Swal from 'sweetalert2';

const ParamsArimaAlert = () => {
  Swal.fire({
    title: 'Parametros adicionales del modelo ARIMA--SARIMA',
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
      // Aquí podrías obtener los valores de los inputs
      const pValue = document.getElementById('inputP').value;
      const dValue = document.getElementById('inputD').value;
      const qValue = document.getElementById('inputQ').value;

      // Hacer lo que necesites con los valores (pValue, dValue, qValue)

      // Aquí un ejemplo de cómo puedes acceder a los valores
      console.log('P:', pValue);
      console.log('D:', dValue);
      console.log('Q:', qValue);
    },
  });
};

export default ParamsArimaAlert;
