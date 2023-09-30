import { MDBCol, MDBContainer, MDBRow, MDBRadio } from "mdb-react-ui-kit"

const DiscontinuedProductsTreat = () => {
  return (
    <MDBContainer>
      <MDBRow style={{"backgroundColor": "#E7E6EF"}} className='mb-2 pt-3 pb-3'>
        <span>PRODUCTOS DESCONTINUADOS</span>
      </MDBRow>
      <MDBRow>
        <MDBCol col='sm'>
          <MDBRow style={{"backgroundColor": "#E7E6EF"}} className='d-flex mb-2'>
            <span style={{'overflow': 'hidden', 'textOverflow': 'ellipsis', 'maxWidth': '300px', 'white-space': 'nowrap'}}>¿Descontinuar con ceros?</span>
          </MDBRow>
          <MDBRadio name='discontinuedWithCeros' id='yes' label='Si' defaultChecked />
          <MDBRadio name='discontinuedWithCeros' id='no' label='No' />
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  )
}

export default DiscontinuedProductsTreat