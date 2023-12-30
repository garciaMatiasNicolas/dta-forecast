import { MDBCheckbox } from 'mdb-react-ui-kit';
import React, { useState, useEffect } from 'react';
import showToast from "../../../other/Toasts";

const ParamsProphet = ({isModelSelected, lastScenariosParams, areParamsSetted}) => {
    const [areInputsEnabled, setInputsEnabled] = useState(false);
    const [seasonalityPriorScale, setSeasonalityPriorScale] = useState(10.0);
    const [changepointPriorScale, setChangepointPriorScale] = useState(0.05);
    const [uncertaintySamples, setUncertaintySamples] = useState(1000);
    const [seasonalityMode, setSeasonalityMode] = useState("additive");
    //const [growth, setGrowth] = useState("linear");

    const [params, setParams] = useState([]);

    useEffect(() => {
        setParams([
          seasonalityMode,
          seasonalityPriorScale,
          uncertaintySamples,
          changepointPriorScale,
        ]);
      }, [
        seasonalityMode,
        seasonalityPriorScale,
        uncertaintySamples,
        changepointPriorScale,
    ]);
    

    useEffect(() => {        
        const hasProphetModel = Array.isArray(isModelSelected) && isModelSelected.includes('prophet');
        setInputsEnabled(hasProphetModel);
    }, [isModelSelected]);

    const handleOnchange = (event, dataType) => {
        const value = event.target.value;
        
        switch (dataType) {
            case 'seasonalityMode':
              setSeasonalityMode(value);
              break;
            case 'seasonalityPriorScale':
              setSeasonalityPriorScale(parseFloat(value));
              break;
            case 'changepointPriorScale':
              setChangepointPriorScale(parseFloat(value));
              break;
            case 'uncertaintySamples':
              setUncertaintySamples(parseInt(value));
              break;
            default:
              break;
        } 
    };

    const handleOnCheckParam = (e) => {
        if (e.target.checked){
            areParamsSetted('prophet', params, 'setParams');
            showToast("Parámetros establecidos exitosamente", "success");
        } else {
            areParamsSetted('prophet', [], 'deleteParams');
            showToast("Parámetros eliminados", "danger");
        }
    }

    const getLastScenarioParams = (e) => {
        if (e.target.checked) {
            if (lastScenariosParams !== undefined){
            
                if(lastScenariosParams.additional_params && lastScenariosParams.additional_params['prophet_params']){
                    setSeasonalityPriorScale(lastScenariosParams.additional_params['prophet_params'][1]);
                    setChangepointPriorScale(lastScenariosParams.additional_params['prophet_params'][3]);
                    setUncertaintySamples(lastScenariosParams.additional_params['prophet_params'][2]);
                } else {
                    setSeasonalityPriorScale(10.0);
                    setChangepointPriorScale(0.05);
                    setUncertaintySamples(1000);
                }
    
            } else {
                setSeasonalityPriorScale(10.0);
                setChangepointPriorScale(0.05);
                setUncertaintySamples(1000);
            }
        } 

        e.target.disabled = true;
    }

    return (
        <div className="w-100 mt-5">
            <p className='text-primary'>Parámetros prophet</p> 
            {lastScenariosParams !== undefined && <MDBCheckbox onChange={getLastScenarioParams} label="Usar parámetros ult. escenario (si hubo)" /> } 

            <div className='w-100 d-flex justify-content-start align-items-center gap-4'>
                <div className="mb-3">
                    <label for="seasonality_mode" className="form-label">Estacionalidad (aditiva)</label>
                    <select onChange={(e) => {handleOnchange(e,'seasonalityMode')}} value={seasonalityMode} id="seasonality_mode" className="form-select w-100" disabled={!areInputsEnabled}>
                        <option value="additive">Aditiva</option>
                        <option value="multiplicative">Multiplicativa</option>
                    </select>
                </div>

                {/* <div className="mb-3">
                    <label for="growth" className="form-label">Crecimiento (lineal)</label>
                    <select onChange={(e) => {handleOnchange(e,'growth')}} value={growth} id="growth" className="form-select w-auto" disabled={!areInputsEnabled}>
                        <option value="linear">Lineal</option>
                        <option value="logistic">Logistic</option>
                    </select>
                </div> */}
            </div> 

            <div className="mb-3">
                <label for="seasonality_prior_scale" className="form-label">Escala prioridad estacional (10.0)</label>
                <input id="seasonality_prior_scale" className="form-control w-auto" type="number" disabled={!areInputsEnabled} value={seasonalityPriorScale} onChange={(e) => {handleOnchange(e,'seasonalityPriorScale')}}/>
            </div>

            <div className="mb-3">
                <label for="changepoint_prior_scale" className="form-label">Tendencia (0.05)</label>
                <input id="changepoint_prior_scale" className="form-control w-auto" type="number" disabled={!areInputsEnabled} value={changepointPriorScale} onChange={(e) => {handleOnchange(e,'changepointPriorScale')}}/>
            </div>

            <div className="mb-3">
                <label for="uncertainty_samples" className="form-label">Muestras de incertidumbre (1000)</label>
                <input id="uncertainty_samples" className="form-control w-auto" type="number" disabled={!areInputsEnabled} value={uncertaintySamples} onChange={(e) => {handleOnchange(e,'uncertaintySamples')}}/>
            </div>

            <div>
                <MDBCheckbox disabled={!areInputsEnabled} label="Set Prophet" id='setprophet' onChange={handleOnCheckParam}/>
            </div>

        </div>
    )
}

export default ParamsProphet
