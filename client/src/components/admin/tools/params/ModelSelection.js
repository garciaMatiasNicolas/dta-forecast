import { MDBCol, MDBRadio, MDBRow  } from 'mdb-react-ui-kit';

const ModelSelection = () => {
  return (
    <MDBCol size='md' >
      <MDBRow style={{"backgroundColor": "#E7E6EF"}} className='d-flex mb-2'>
        <span className='fw-bold'>Seleccion de Modelo</span>
      </MDBRow>
      <form>
        <MDBRadio name='modelselection' id='manual' label='Manual' defaultChecked />
        <MDBRadio name='modelselection' id='expert' label='Experto' />
      </form>
    </MDBCol>
  )
}

export default ModelSelection