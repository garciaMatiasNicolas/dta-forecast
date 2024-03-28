import Swal from "sweetalert2";

const ParamsProphetAlert = async () => {
  return await Swal.fire({
    title: 'Parametros adicionales del modelo Prophet',
    html: `
        <div class="mb-3">
            <label for="seasonality_mode" class="form-label">Estacionalidad</label>
            <select id="seasonality_mode" class="form-select">
                <option value="additive">Aditiva</option>
                <option value="multiplicative">Multiplicativa</option>
            </select>
        </div>

        <div class="mb-3">
            <label for="seasonality_prior_scale" class="form-label">Escala de prioridad estacional</label>
            <input id="seasonality_prior_scale" class="form-control" type=number />
        </div>

        <div class="mb-3">
            <label for="growth" class="form-label">Modelado de crecimiento</label>
            <select id="growth" class="form-select">
                <option value="linear">Lineal</option>
                <option value="logistic">Logistic</option>
            </select>
        </div>

        <div class="mb-3">
            <label for="uncertainty_samples" class="form-label">Cantidad de muestras para calcular la incertidumbre en las predicciones</label>
            <input id="uncertainty_samples" class="form-control" type=number />
        </div>

        <div class="mb-3">
            <label for="changepoint_prior_scale" class="form-label">Tendencia</label>
            <input id="changepoint_prior_scale" class="form-control" type=number />
        </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Confirmar parametros adicionales',
    cancelButtonText: 'Dejar valores por defecto',
    showLoaderOnConfirm: true,
    allowOutsideClick: false,
    preConfirm: () => {
      const seasonality_mode = document.getElementById('seasonality_mode').value;
      const seasonality_prior_scale = parseFloat(document.getElementById('seasonality_prior_scale').value);
      const growth = document.getElementById('growth').value;
      const uncertainty_samples = parseFloat(document.getElementById('uncertainty_samples').value);
      const changepoint_prior_scale = parseFloat(document.getElementById('changepoint_prior_scale').value);

      if (!seasonality_mode || !seasonality_prior_scale || !growth || !uncertainty_samples 
            || !changepoint_prior_scale) {
        Swal.showValidationMessage('Ingrese todos los valores.');
        return false; // Detiene el cierre del modal si falta algún valor
      }

      return { value: { seasonality_mode, seasonality_prior_scale, growth, uncertainty_samples, changepoint_prior_scale } };
    },
  });
};

export default ParamsProphetAlert;