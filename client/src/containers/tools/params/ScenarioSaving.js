import React, { useState, useEffect } from 'react';
import { MDBCol, MDBRow, MDBInput, MDBContainer } from 'mdb-react-ui-kit';

const ScenarioSaving = ({scenarioName, predP}) => {
  
    //scenarioName === undefined && predP === undefined ? console.log("") : console.log(scenarioName, predP)
  return (
    <MDBContainer>
      <MDBRow className='bg-primary d-flex justify-content-center align-items-center p-2'>
        <h5 className='text-white w-auto'>Guardar escenario</h5>
      </MDBRow>

      <MDBRow className="gap-1">
        <MDBCol col='md'>
          <MDBRow style={{"backgroundColor": "#E7E6EF"}} className='d-flex mb-2'>
            <span>Nombre de Escenario</span>
          </MDBRow>
          <MDBInput
            label='Nombre'
            name='scenario_name'
            type='text'
            //value={scenarioName}
            //onChange={(e) => setScenarioName(e.target.value)}
          />
        </MDBCol>
        <MDBCol>
          <MDBRow style={{"backgroundColor": "#E7E6EF"}} className='d-flex mb-2'>
            <span>Periodos de forecast</span>
          </MDBRow>
          <MDBInput
            label='Periodos'
            name='pred_p'
            type='number'
            //value={predP}
            //onChange={(e) => setPredP(e.target.value)}
          />
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default ScenarioSaving;
