import { MDBCheckbox } from 'mdb-react-ui-kit';
import React, { useEffect, useState } from 'react'

const ParamsHolts = ({isModelSelected}) => {

    const [areInputsEnabled, setInputsEnabled] = useState(false);

    useEffect(() => {
        const hasProphetModel = Array.isArray(isModelSelected) && (isModelSelected.includes('holtsWintersExponentialSmoothing')|| isModelSelected.includes('holtsExponentialSmoothing')) ;
        setInputsEnabled(hasProphetModel);
    }, [isModelSelected]);

  return (
    <div className="w-100 mt-4">
        <p className='text-primary'>Parámetros holts - holts winters</p>  
        <div className='w-auto d-flex justify-content-start align-items-center gap-4'>
            <div class="mb-3">
                <label for="selectTrend" className="form-label">Tendencia (Aditiva)</label>
                <select id="selectTrend" className="form-select w-auto" disabled={!areInputsEnabled}>
                    <option value="add">Aditiva</option>
                    <option value="mul">Multiplicativa</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="selectSeasonal" className="form-label">Estacionalidad (Aditiva)</label>
                <select id="selectSeasonal" className="form-select w-auto" disabled={!areInputsEnabled}>
                    <option value="add">Aditiva</option>
                    <option value="mul">Multiplicativa</option>`         
                </select>
            </div>
            
        </div>
        <div>
            <MDBCheckbox disabled={!areInputsEnabled} label="Set Holts"/>
        </div>
    </div>
  )
}

export default ParamsHolts
