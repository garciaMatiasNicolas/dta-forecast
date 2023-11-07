import ToolsNav from '../../components/navs/ToolsNav';
import Navbar from '../../components/navs/Navbar';
import MetricsByDateContainer from '../../containers/tools/reports/MetricsByDateContainer';

const MetricsAnalysisPage = () => {
  return (
    <>
        <Navbar/>
        <main style={{"minHeight": "100vh"}} className="d-flex flex-column justify-content-start gap-3 align-items-start p-3 pt-5 bg-white">
            <ToolsNav/>
            <MetricsByDateContainer/>
        </main>
    </>
  )
}

export default MetricsAnalysisPage