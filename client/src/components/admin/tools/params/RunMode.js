import { MDBCol, MDBRadio, MDBRow  } from 'mdb-react-ui-kit';

const RunMode = () => {
  return (
    <MDBCol size='md' >
      <MDBRow style={{"backgroundColor": "#E7E6EF"}} className='d-flex'>
        <span className='fw-bold'>Correr Modelo</span>
      </MDBRow>
      <form>
        <MDBRadio name='runmode' id='bottom_up' label='De abajo arriba' defaultChecked />
        <MDBRadio name='runmode' id='bottom_down' label='De arriba abajo' />
        <MDBRadio name='runmode' id='both' label='Ambos ' />
      </form>
    </MDBCol>
  )
}

export default RunMode