import { MDBCol, MDBContainer, MDBRow, MDBRadio, MDBInput } from "mdb-react-ui-kit";


const Outliers = () => {
  return (
    <MDBContainer>
        <MDBRow className="mb-4">
            <MDBCol className="p-0">
                <MDBRow style={{"backgroundColor": "#E7E6EF"}} className='d-flex mb-2'>
                    <span>¿Reemplazar?</span>
                </MDBRow>
                <MDBRadio name='replaceOutliers' id='yes' label='Si' defaultChecked />
                <MDBRadio name='replaceOutliers' id='no' label='No' />
            </MDBCol>

            <MDBCol className="p-0">
                <MDBRow style={{"backgroundColor": "#E7E6EF"}} className='d-flex mb-2'>
                    <span style={{'overflow': 'hidden', 'textOverflow': 'ellipsis', 'maxWidth': '200px', 'white-space': 'nowrap'}} >Tamaño de la Ventana para la Detección de Valores Atípicos</span>
                </MDBRow>
                <MDBInput name='scenario_name' type='text'/>
            </MDBCol>
        </MDBRow>

        <MDBRow className="mb-3">
            <MDBCol className="mb-4">
                <MDBRow style={{"backgroundColor": "#E7E6EF"}} className='d-flex mb-2'>
                    <span style={{'overflow': 'hidden', 'textOverflow': 'ellipsis', 'maxWidth': '200px', 'white-space': 'nowrap'}} >Método de detección de valores atípicos</span>
                </MDBRow>
                <MDBRadio name='replaceOutliers' id='yes' label='Media - Estándar' defaultChecked />
                <MDBRadio name='replaceOutliers' id='no' label='Rango intercuartil' />
            </MDBCol>
        </MDBRow>
    </MDBContainer>
  )
}

export default Outliers