import ToolsNav from '../../components/navs/ToolsNav';
import Navbar from '../../components/navs/Navbar';
import MetricsByDateContainer from '../../containers/tools/reports/MetricsByDateContainer';
import GraphicBySku from '../../containers/tools/reports/GraphicBySku';
import { useState } from 'react';
import { MDBIcon } from 'mdb-react-ui-kit';

const MetricsAnalysisPage = () => {
  const [graphs, setGraphs] = useState(false);
  const navigateComponents = () => {
    setGraphs(!graphs);
  };
  return (
    <>
      <Navbar/>
      <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-start gap-3 align-items-start p-3 pt-5 bg-white">
        <ToolsNav/>

        <div className='d-flex justify-content-center align-items-center w-auto gap-2 ms-5 '>
          <MDBIcon fas icon="angle-double-right" color='primary' />
          <p style={{'cursor':'pointer'}} onClick={navigateComponents} className='mt-3 text-primary text-decoration-underline'>{!graphs ? "Analisis de forecast por producto" : "Ver métricas de error"}</p>
        </div>

        {!graphs ? <MetricsByDateContainer/> : <GraphicBySku />}
        
      </main>
    </>
  )
}

export default MetricsAnalysisPage