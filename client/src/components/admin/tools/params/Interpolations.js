import { MDBCol, MDBRadio, MDBRow } from "mdb-react-ui-kit"


const Interpolations = () => {
  return (
    <MDBCol>
        <MDBRow style={{"backgroundColor": "#E7E6EF"}} className='mb-2 pt-3 pb-3'>
            <span>INTERPOLACIÓN</span>
        </MDBRow>

        <MDBRow className="gap-1">
            <MDBCol size='sm'>
                <MDBRow className="mb-4">
                    <MDBRow style={{"backgroundColor": "#E7E6EF"}} className='d-flex mb-2'>
                        <span>Interpolar negativo</span>
                    </MDBRow>
                    <MDBRadio name='interpolateNegative' id='yes' label='Si' defaultChecked />
                    <MDBRadio name='interpolateNegative' id='no' label='No' />
                </MDBRow>
                <MDBRow  style={{"marginBottom": "40px"}}>
                    <MDBRow style={{"backgroundColor": "#E7E6EF"}} className='d-flex mb-2'>
                        <span>Interpolar negativo</span>
                    </MDBRow>

                    <MDBRadio name='interpolateZeros' id='yes' label='Si' defaultChecked />
                    <MDBRadio name='interpolateZeros' id='no' label='No' />
                </MDBRow>
                <MDBRow>
                    <MDBRow style={{"backgroundColor": "#E7E6EF"}} className='d-flex mb-2'>
                        <span>Valores perdidos</span>
                    </MDBRow>

                    <MDBRadio name='missingValues' id='yes' label='Con metodo seleccionado' defaultChecked />
                    <MDBRadio name='missingValues' id='no' label='Reemplazar con cero' />
                </MDBRow>
            </MDBCol>

            <MDBCol size='sm'>
                <MDBRow style={{"backgroundColor": "#E7E6EF"}} className='d-flex mb-2'>
                    <span>Metodo</span>
                </MDBRow>
                
            </MDBCol>
        </MDBRow>

    </MDBCol>
  )
}

export default Interpolations