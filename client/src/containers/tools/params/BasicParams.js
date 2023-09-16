import { MDBContainer, MDBRow } from 'mdb-react-ui-kit';
import RunMode from '../../../components/admin/tools/params/RunMode';
import ModelSelection from '../../../components/admin/tools/params/ModelSelection';
import TopDownDimensions from '../../../components/admin/tools/params/TopDownDimensions';
import OptimizedMetrics from '../../../components/admin/tools/params/OptimizedMetrics';

const BasicParams = () => {
  return (
    <MDBContainer className='gap-1'>
      <MDBRow className='bg-primary d-flex justify-content-center align-items-center p-2'>
        <h5 className='text-white w-auto'>Parametros Basicos</h5>
      </MDBRow>
      <MDBRow className='gap-1'>
        <RunMode/>
        <ModelSelection/>
      </MDBRow>
      <MDBRow className='gap-1'>
        <TopDownDimensions/>
        <OptimizedMetrics/>
      </MDBRow>
    </MDBContainer>
  )
}

export default BasicParams