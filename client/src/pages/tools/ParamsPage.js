import AdvancedParamsContainer from "../../containers/tools/params/AdvancedParamsContainer";
import BasicParams from "../../containers/tools/params/BasicParams"
import { MDBContainer, MDBRow, MDBCol } from 'mdb-react-ui-kit';

const ParamsPage = () => {
  return (
    <main style={{"minHeight": "100vh"}} className="bg-white">
      <MDBContainer className="pt-5">

        <MDBRow>
          <MDBCol size='lg'>
            <BasicParams />
          </MDBCol>

          <MDBCol size='lg'>
            ScenarioSaving
          </MDBCol>
        </MDBRow>

        <MDBRow className="mt-5">
          <MDBCol>
            <AdvancedParamsContainer/>
          </MDBCol>
        </MDBRow>

      </MDBContainer>
    </main>
  )
}

export default ParamsPage