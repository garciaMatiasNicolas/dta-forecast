import { MDBCol, MDBContainer, MDBRow } from 'mdb-react-ui-kit';
import ModelSelectAdv from '../../../components/admin/tools/params/ModelSelectAdv';
import Outliers from '../../../components/admin/tools/params/Outliers';
import DiscontinuedProductsTreat from '../../../components/admin/tools/params/DiscontinuedProductsTreat';

const AdvancedParamsContainer = () => {
  return (
    <MDBContainer>
      <MDBRow className='bg-primary d-flex justify-content-center align-items-center p-2'>
        <h5 className='text-white w-auto'>Parametros Avanzados</h5>
      </MDBRow>
      <MDBRow>
        <MDBRow className='p-3 w-100 d-flex' >
          <h5>SELECCION DE MODELO</h5>
        </MDBRow>
        <ModelSelectAdv/>
        
        <MDBCol size='md'>
          <Outliers/>
          <DiscontinuedProductsTreat/>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  )
}

export default AdvancedParamsContainer