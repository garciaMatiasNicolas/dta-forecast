import ToolsNav from '../../components/navs/ToolsNav';
import Navbar from '../../components/navs/Navbar';
import MetricsByDateContainer from '../../containers/tools/reports/MetricsByDateContainer';
import GraphicBySku from '../../containers/tools/reports/GraphicBySku';
import { useState } from 'react';

const MetricsAnalysisPage = () => {
  const [graphs, setGraphs] = useState(false);
  return (
    <>
      <Navbar/>
      <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-start gap-3 align-items-start p-3 pt-5 bg-white">
        <ToolsNav/>
        {!graphs ? <h5 className='px-3 mb-5 text-primary' style={{cursor: "pointer"}} onClick={()=>{setGraphs(true)}}>Ver métricas por producto</h5> : <h5 style={{cursor: "pointer"}} className='px-3 mb-5 text-primary' onClick={()=>{setGraphs(false)}}>Ver métricas de error</h5>}
        {!graphs ? <MetricsByDateContainer/> : <GraphicBySku />}
        
      </main>
    </>
  )
}

export default MetricsAnalysisPage