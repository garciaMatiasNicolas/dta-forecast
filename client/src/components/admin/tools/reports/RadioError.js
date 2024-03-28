import React from 'react';
import { MDBRadio } from 'mdb-react-ui-kit';

const RadioError =  () => {
  return (
    <div className='w-100 d-flex flex-wrap justify-content-end'>
      <MDBRadio name='inlineRadio' id='MAPE' value='MAPE' label='MAPE' inline />
      <MDBRadio name='inlineRadio' id='SMAPE' value='SMAPE' label='SMAPE' inline />
      <MDBRadio name='inlineRadio' id='RMSE' value='RMSE' label='RMSE' inline />
    </div>
  );
}

export default RadioError;