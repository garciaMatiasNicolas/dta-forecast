import ToolsNav from '../../components/navs/ToolsNav';
import Graph from '../../components/admin/tools/volume/Graph.js';

const VolumePage = () => {
  return (
    <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-start gap-3 align-items-start p-3 pt-5 bg-white">
      <ToolsNav/>
      <Graph/>
    </main>
  )
}

export default VolumePage





