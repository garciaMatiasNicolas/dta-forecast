import Swal from "sweetalert2";
import { showWariningAlert } from "./Alerts";

const ParamsHoltsWintersAlert = async (modelName) => {
    return await Swal.fire({
      title: `Parametros adicionales del modelo ${modelName}`,
      html: `
        <div class="mb-3">
          <label for="selectTrend" class="form-label">Tendencia</label>
          <select id="selectTrend" class="form-select">
            <option value="add">Aditiva</option>
            <option value="mul">Multiplicativa</option>
          </select>
        </div>
       
        <div class="mb-3">
            <label for="selectSeasonal" class="form-label">Estacionalidad</label>
            <select id="selectSeasonal" class="form-select">
            ${
                modelName === "holtsWinters" ?
                `<option value="add">Aditiva</option>
                <option value="mul">Multiplicativa</option>`
                :
                `<option value="None">Parametro null</option>`
            }
            </select>
          </div>`  
      ,
      showCancelButton: true,
      confirmButtonText: 'Confirmar parametros adicionales',
      cancelButtonText: 'Dejar valores por defecto',
      showLoaderOnConfirm: true,
      allowOutsideClick: false,
      preConfirm: () => {
        const selectedTrend = document.getElementById('selectTrend').value;
        const selectedSeasonal = document.getElementById('selectSeasonal').value;
        
        if (!selectedTrend || !selectedSeasonal ) {
          Swal.showValidationMessage('Ingrese todos los valores.');
          return false; // Detiene el cierre del modal si falta algún valor
        }

        if (selectedSeasonal === 'mul' || selectedTrend === 'mul'){
          Swal.showValidationMessage("Las opciones de los parametros multiplicativas deben ser seleccionados si la historical data no contiene valores en 0 o negativos");
          return false;
        }
  
        return { value: { selectedTrend, selectedSeasonal } };
      },
    });
};  

export default ParamsHoltsWintersAlert;