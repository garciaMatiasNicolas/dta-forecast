import ToolsNav from '../../components/navs/ToolsNav';
import Graph from '../../components/admin/tools/volume/Graph.js';
import {Link} from 'react-router-dom';


const VolumePage = () => {
  return (
    <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-start gap-3 align-items-start p-3 pt-5 bg-white">
      <div className='w-100 d-flex justify-content-between align-items-center'>
        <ToolsNav/>
        <Link to='/metrics-analysis' className='me-5 text-decoration-underline'>Analísis de Métricas de error</Link>
      </div>
      <Graph/>
    </main>
  )
}

export default VolumePage





