import { MDBCheckbox } from 'mdb-react-ui-kit';
import React, { useEffect, useState } from 'react'
import showToast from '../../../other/Toasts';

const ParamsArima = ({isModelSelected, lastScenariosParams, setAdditionalParams}) => {
    const [areInputsEnabledForArima, setInputsEnabledForArima] = useState(false);
    const [areInputsEnabledForSarima, setInputsEnabledForSarima] = useState(false);
    const [pArima, setpArima] = useState(0);
    const [qArima, setqArima] = useState(0);
    const [dArima, setdArima] = useState(0);
    const [pSarima, setpSarima] = useState(0);
    const [qSarima, setqSarima] = useState(0);
    const [dSarima, setdSarima] = useState(0);

    useEffect(() => {
        const hasArimaModel = Array.isArray(isModelSelected) && (isModelSelected.includes('arima'));
        const hasSarimaModel = Array.isArray(isModelSelected) && (isModelSelected.includes('sarima'));

        setInputsEnabledForArima(hasArimaModel);
        setInputsEnabledForSarima(hasSarimaModel);
    }, [isModelSelected]);

    const handleOnchange = (event, dataType) => {
        const value = event.target.value;
    
        // Verificar si el valor es un número válido
        const numericValue = !isNaN(value) && value !== '' ? value : '0';
    
        switch (dataType) {
            case 'pArima':
                setpArima(parseInt(numericValue, 10));
                break;
            case 'dArima':
                setdArima(parseInt(numericValue, 10));
                break;
            case 'qArima':
                setqArima(parseInt(numericValue, 10));
                break;
            case 'pSarima':
                setpSarima(parseInt(numericValue, 10));
                break;
            case 'dSarima':
                setdSarima(parseInt(numericValue, 10));
                break;
            case 'qSarima':
                setqSarima(parseInt(numericValue, 10));
                break;
            default:
                break;
        }
    };    

    const handleOnCheckParam = (e) => {
        if (e.target.checked) {
            if (e.target.id === 'setarima') {
                setAdditionalParams('arima', [pArima, dArima, qArima], 'setParams');
            }

            if (e.target.id === 'setsarima') {
                setAdditionalParams('sarima', [pSarima, dSarima, qSarima], 'setParams');
            }

            showToast("Parámetros establecidos exitosamente", "success");
        } else {
            if (e.target.id === 'setarima') {
                setAdditionalParams('arima', [], 'deleteParams');
            }

            if (e.target.id === 'setsarima') {
                setAdditionalParams('sarima', [], 'deleteParams');
            }
        }
    }

    const lastScenarioParams = (e) => {
        if (e.target.checked) {
            if (lastScenariosParams !== undefined) {
            
                if (lastScenariosParams.additional_params && lastScenariosParams.additional_params['arima_params']) {
                    const [pArimaParam, dArimaParam, qArimaParam] = lastScenariosParams.additional_params['arima_params'];
                    setpArima(pArimaParam);
                    setdArima(dArimaParam);
                    setqArima(qArimaParam);
                }
    
                if (lastScenariosParams.additional_params && lastScenariosParams.additional_params['sarima_params']) {
                    const [pSarimaParam, dSarimaParam, qSarimaParam] = lastScenariosParams.additional_params['sarima_params'];
                    setpSarima(pSarimaParam);
                    setdSarima(dSarimaParam);
                    setqSarima(qSarimaParam);
                }
            }
        }

        e.target.disabled = true;
    }

    return (
        <div className="w-100 mt-4 d-flex justify-content-start align-items-center flex-wrap gap-2">
            <p className='text-primary'>Parámetros arima - sarima </p>
            {lastScenariosParams !== undefined && <MDBCheckbox onChange={lastScenarioParams} label="Usar parámetros ult. escenario (si hubo)" /> } 
        
            <div className="w-auto">
                <label for="inputP" className="form-label">Orden del componente de autoregresión estacional (0)</label>
                
                <div className='d-flex justify-content-center align-items-center gap-2 w-auto'>
                    <input disabled={!areInputsEnabledForArima} name="inputParima" id='inputP' className="form-control w-auto" placeholder="Ingrese P ARIMA-X" value={parseInt(pArima)} onChange={(e)=>{handleOnchange(e,'pArima')}}/>

                    <input disabled={!areInputsEnabledForSarima} name="inputPsarima" id='inputP' className="form-control w-auto" placeholder="Ingrese P SARIMA-X" value={parseInt(pSarima)} onChange={(e)=>{handleOnchange(e,'pSarima')}}/>
                </div>
            </div>

            <div className="w-auto">
                <label for="inputD" className="form-label">Grado de diferenciación estacional (0)</label>
                <div className='d-flex justify-content-center align-items-center gap-2 w-auto'>
                    <input disabled={!areInputsEnabledForArima} id="inputD" name="inputDarima" className="form-control w-auto" placeholder="Ingrese D ARIMA-X" value={parseInt(dArima)} onChange={(e)=>{handleOnchange(e,'dArima')}}/>

                    <input disabled={!areInputsEnabledForSarima} id="inputD" name="inputDsarima" className="form-control w-auto" placeholder="Ingrese D SARIMA-X" value={parseInt(dSarima)} onChange={(e)=>{handleOnchange(e,'dSarima')}}/>
                </div>
            </div>

            <div className="w-auto">
                <label for="inputQ" className="form-label">Orden del componente de media móvil estacional (0)</label>
                
                <div className='d-flex justify-content-center align-items-center gap-2 w-auto'>
                    <input disabled={!areInputsEnabledForArima} name="inputQarima" id="inputQ" className="form-control w-auto" placeholder="Ingrese Q ARIMA-X" value={parseInt(qArima)} onChange={(e)=>{handleOnchange(e,'qArima')}}/>
                    
                    <input disabled={!areInputsEnabledForSarima} name="inputQsarima" id="inputQ" className="form-control w-auto" placeholder="Ingrese Q SARIMA-X" value={parseInt(qSarima)} onChange={(e)=>{handleOnchange(e,'qSarima')}}/>
                </div>
            </div>

            <div style={{width:"344px"}}>
                <div className='d-flex justify-content-between align-items-center'>
                    <MDBCheckbox 
                        onChange={handleOnCheckParam} id='setarima' 
                        label="Set ARIMA" disabled={!areInputsEnabledForArima}
                    />
                    
                    <MDBCheckbox 
                        label="Set SARIMA" id='setsarima' 
                        onChange={handleOnCheckParam} disabled={!areInputsEnabledForSarima}
                    />
                </div>
            </div>
        </div>
    );
}

export default ParamsArima
