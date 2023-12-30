import ToolsNav from '../../components/navs/ToolsNav';
import ExplorationContainer from '../../containers/tools/exploration/ExplorationContainer';

const ExplorationPage = () => {
  return (
    <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-start gap-3 align-items-start p-3 pt-5 bg-white">
      <ToolsNav/>
      <ExplorationContainer/>
    </main>
  )
}

export default ExplorationPage