import { MDBCol, MDBCheckbox, MDBRow } from "mdb-react-ui-kit"


const ModelSelectAdv = () => {
  return (
    <MDBCol sm='4'>
        <MDBRow style={{"backgroundColor": "#E7E6EF"}} className='d-flex mb-2'>
            <span>Modelos</span>
        </MDBRow>
        <MDBCheckbox name='modelSelection' value='' id='all' label='Todos'/>
        <MDBCheckbox name='modelSelection' value='' id='none' label='Ninguno'/>
        <MDBCheckbox name='modelSelection' value='' id='holtsWintersExponentialSmoothing' label='Suavización Exponencial Holt-Winters' defaultChecked/>
        <MDBCheckbox name='modelSelection' value='' id='holtsExponentialSmoothing' label='Suavización Exponencial Holt' defaultChecked/>
        <MDBCheckbox name='modelSelection' value='' id='simpleExponentialSmoothing' label='Suavización Exponencial Simple' defaultChecked />
        <MDBCheckbox name='modelSelection' value='' id='linearExponentialSmoothing' label='Suavización Exponencial Lineal' defaultChecked/>
        <MDBCheckbox name='modelSelection' value='' id='ETSExponentialSmoothing' label='Suavización Exponencial ETS' defaultChecked />
        <MDBCheckbox name='modelSelection' value='' id='arima' label='ARIMA ' defaultChecked/>
        <MDBCheckbox name='modelSelection' value='' id='arimax' label='ARIMAX' defaultChecked />
        <MDBCheckbox name='modelSelection' value='' id='sarima' label='SARIMA' defaultChecked/>
        <MDBCheckbox name='modelSelection' value='' id='sarimax' label='SARIMAX ' defaultChecked />
        <MDBCheckbox name='modelSelection' value='' id='autoArima' label='Auto ARIMA' defaultChecked/>
        <MDBCheckbox name='modelSelection' value='' id='autoArimax' label='Auto ARIMAX' defaultChecked />
    </MDBCol>
  )
}

export default ModelSelectAdv