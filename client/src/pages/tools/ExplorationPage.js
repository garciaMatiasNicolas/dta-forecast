import { useState } from 'react';
import ToolsNav from '../../components/navs/ToolsNav';
import ExplorationContainer from '../../containers/tools/exploration/ExplorationContainer';
import AllocationMatrixContainer from '../../containers/tools/exploration/AllocationMatrixContainer';
import { MDBIcon } from 'mdb-react-ui-kit';

const ExplorationPage = () => {

  const [showComponent, setShowComponent] = useState(false);
  
  const navigateComponents = () => {
    setShowComponent(!showComponent);
  };

  return (
    
    <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-start gap-3 align-items-start p-3 pt-5 bg-white">
      <ToolsNav/>
      
      <div className='d-flex justify-content-center align-items-center w-auto gap-2 ms-5 '>
        <MDBIcon fas icon="angle-double-right" color='primary' />
        <p style={{'cursor':'pointer'}} onClick={navigateComponents} className='mt-3 text-primary text-decoration-underline'>{!showComponent ? "Matriz de correlación variables exogenas" : "Analisis exploratorio"}</p>
      </div>
    
      {!showComponent ? <ExplorationContainer/> : <AllocationMatrixContainer/>}
      
    </main>
  )
}

export default ExplorationPage