import { MDBCol, MDBRadio, MDBRow  } from 'mdb-react-ui-kit';

const OptimizedMetrics = () => {
  return (
    <MDBCol size='md'>
      <MDBRow style={{"backgroundColor": "#E7E6EF"}} className='d-flex'>
        <span className='fw-bold'>Correr Modelo</span>
      </MDBRow>
      <form>
        <MDBRadio name='optimizedmetric' id='mape' label='MAPE' />
        <MDBRadio name='optimizedmetric' id='smape' label='SMAPE' />
        <MDBRadio name='optimizedmetric' id='rmse' label='RMSE ' defaultChecked/>
        <MDBRadio name='optimizedmetric' id='mae' label='MAE '/>
      </form>
    </MDBCol>
  )
}

export default OptimizedMetrics