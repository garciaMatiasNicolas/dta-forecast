import { MDBCol, MDBContainer, MDBRow } from 'mdb-react-ui-kit';
import ModelSelectAdv from '../../../components/admin/tools/params/ModelSelectAdv';
import Outliers from '../../../components/admin/tools/params/Outliers';
import DiscontinuedProductsTreat from '../../../components/admin/tools/params/DiscontinuedProductsTreat';
import Interpolations from '../../../components/admin/tools/params/Interpolations';

const AdvancedParamsContainer = () => {
  return (
    <MDBContainer>
      <MDBRow className='bg-primary d-flex justify-content-center align-items-center p-2'>
        <h5 className='text-white w-auto'>Parametros Avanzados</h5>
      </MDBRow>
      <MDBRow className='gap-1'>
        <ModelSelectAdv/>
        
        <MDBCol size='sm' className='gap-1'>
          <MDBRow style={{"backgroundColor": "#E7E6EF"}} className='mb-2 pt-3 pb-3'>
            <span>VALORES ATÍPICOS</span>
          </MDBRow>
          <Outliers/>
          <DiscontinuedProductsTreat/>
          
        </MDBCol>

        <Interpolations/>
      </MDBRow>
    </MDBContainer>
  )
}

export default AdvancedParamsContainer