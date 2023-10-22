import { MDBCard, MDBCardBody, MDBCardText, MDBCardTitle, MDBIcon } from 'mdb-react-ui-kit'
import React from 'react'
import ToolsNav from '../../components/navs/ToolsNav'
import { useNavigate } from 'react-router-dom'

const KpisPage = () => {

  const navigate = useNavigate();

  return (
    <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-start gap-3 align-items-start p-3 pt-5 bg-white">
      <ToolsNav/>
      <div className='w-100 d-flex justify-content-center alignt-items-center flex-column'>
        <h1 className='text-center'>Reportes KPIs</h1>
        <div className='w-auto d-flex justify-content-center align-items-center gap-2'>
          <MDBCard style={{"width": "19rem", "cursor": "pointer", "alignSelf":"center"}} alignment='center' className='hover-shadow border mt-5'>
            <MDBCardBody>
              <MDBCardTitle>Kpi General</MDBCardTitle>
              <MDBCardText>Tendencia & Estacionalidad</MDBCardText>
              <MDBIcon fas icon="chart-line" size='6x' color='primary'/>
            </MDBCardBody>
          </MDBCard>
          
          <MDBCard style={{"width": "19rem", "cursor": "pointer", "alignSelf":"center"}} alignment='center' className='hover-shadow border mt-5' onClick={()=>{navigate("/detail-report")}}>
            <MDBCardBody>
              <MDBCardTitle>Kpi Detallado</MDBCardTitle>
              <MDBCardText>YTD, MTD, FGY</MDBCardText>
              <MDBIcon fas icon="diagnoses" size='6x' color='primary'/>
            </MDBCardBody>
          </MDBCard> 
        </div>
      </div>
    </main>
  )
}

export default KpisPage