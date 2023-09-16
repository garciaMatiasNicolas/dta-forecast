import { MDBCol, MDBContainer, MDBRow, MDBRadio } from "mdb-react-ui-kit"


const Outliers = () => {
  return (
    <MDBContainer>
        <MDBRow className="gap-1">
            <MDBCol sm='3'>
                <MDBRow style={{"backgroundColor": "#E7E6EF"}} className='d-flex mb-2'>
                    <span className='fw-bold'>¿Reemplazar?</span>
                </MDBRow>
                <MDBRadio name='replaceOutliers' id='yes' label='Si' defaultChecked />
                <MDBRadio name='replaceOutliers' id='no' label='No' />
            </MDBCol>

            <MDBCol sm='3'>
                <MDBRow style={{"backgroundColor": "#E7E6EF"}} className='d-flex mb-2'>
                    <span style={{'overflow': 'hidden', 'textOverflow': 'ellipsis', 'maxWidth': '200px', 'white-space': 'nowrap'}} className='fw-bold'>Tamaño de la Ventana para la Detección de Valores Atípicos</span>
                </MDBRow>
                <MDBRadio name='replaceOutliers' id='yes' label='Si' defaultChecked />
                <MDBRadio name='replaceOutliers' id='no' label='No' />
            </MDBCol>
        </MDBRow>

        <MDBRow>
            <MDBCol>

            </MDBCol>

            <MDBCol>

            </MDBCol>
        </MDBRow>
    </MDBContainer>
  )
}

export default Outliers